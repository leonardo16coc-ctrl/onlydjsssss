import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeScheduler } from "./scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe webhook MUST be registered before express.json() to preserve raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const { handleStripeWebhook } = await import("../webhooks/stripe");
    return handleStripeWebhook(req, res);
  });
  
  // Sellfy webhook endpoint
  app.post("/api/sellfy/webhook", express.json(), async (req, res) => {
    const { handleSellfyWebhook } = await import("../sellfy-webhook");
    return handleSellfyWebhook(req, res);
  });
  
  // Resend webhook endpoint for email tracking
  app.post("/api/resend/webhook", express.json(), async (req, res) => {
    const { handleResendWebhook } = await import("../routes/resend-webhook");
    return handleResendWebhook(req, res);
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoints with multer
  const multer = (await import("multer")).default;
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1000 * 1024 * 1024, // 1000MB (1GB) for audio
    },
  });
  
  const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for images
    },
  });
  
  app.post("/api/upload/audio", upload.single("file"), async (req, res) => {
    const { uploadAudioFile, isUploadError } = await import("../fileUpload");
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const result = await uploadAudioFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        1 // userId - will be replaced with actual user ID from session
      );
      
      if (isUploadError(result)) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error) {
      console.error("[Upload] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/upload/cover", uploadImage.single("file"), async (req, res) => {
    const { uploadImageFile, isUploadError } = await import("../fileUpload");
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const result = await uploadImageFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        1 // userId - will be replaced with actual user ID from session
      );
      
      if (isUploadError(result)) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error) {
      console.error("[Upload] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  
  // Static legal pages for Stripe compliance (bot-readable)
  const path = await import("path");
  const fs = await import("fs");
  const { fileURLToPath } = await import("url");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Use project root to find static-legal directory
  const projectRoot = path.resolve(__dirname, "../..");
  const legalPagesDir = path.join(projectRoot, "server/static-legal");
  
  app.get("/terms", (req, res) => {
    const filePath = path.join(legalPagesDir, "terms.html");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Terms of Service not found");
    }
  });
  
  app.get("/privacy", (req, res) => {
    const filePath = path.join(legalPagesDir, "privacy.html");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Privacy Policy not found");
    }
  });
  
  app.get("/copyright", (req, res) => {
    const filePath = path.join(legalPagesDir, "copyright.html");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Copyright Policy not found");
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize 24/7 scout scheduler
    initializeScheduler();
  });
}

startServer().catch(console.error);
