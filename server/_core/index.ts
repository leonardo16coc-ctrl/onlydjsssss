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
  
  // ============= OPEN GRAPH SSR ENDPOINTS =============
  // When bots (WhatsApp, Telegram, Slack, Twitter) visit track URLs,
  // serve a lightweight HTML page with proper OG meta tags.
  // This enables rich link previews without full SSR.
  const BOT_USER_AGENTS = [
    'facebookexternalhit', 'twitterbot', 'whatsapp', 'telegrambot',
    'slackbot', 'linkedinbot', 'discordbot', 'googlebot', 'bingbot',
    'applebot', 'pinterest', 'vkshare', 'w3c_validator', 'curl', 'wget',
    'python-requests', 'axios', 'node-fetch', 'got',
  ];
  
  const isBot = (userAgent: string = '') => {
    const ua = userAgent.toLowerCase();
    return BOT_USER_AGENTS.some(bot => ua.includes(bot));
  };

  const buildOgHtml = (track: {
    id: number; title: string; artist: string; genre?: string | null;
    bpm?: number | null; musicalKey?: string | null; coverImageUrl?: string | null;
    audioFileUrl?: string | null; durationSeconds?: number | null;
    username?: string | null; djName?: string | null; trackType?: string | null;
  }) => {
    const siteUrl = 'https://www.onlydjss.com';
    const canonicalUrl = track.username
      ? `${siteUrl}/dj/${track.username}/track/${track.id}`
      : `${siteUrl}/track/${track.id}`;
    const image = track.coverImageUrl || `${siteUrl}/logo-new-gradient.webp`;
    const djDisplay = track.djName || track.username || track.artist;
    const bpmInfo = track.bpm ? ` • ${track.bpm} BPM` : '';
    const keyInfo = track.musicalKey ? ` • ${track.musicalKey}` : '';
    const typeInfo = track.trackType ? ` [${track.trackType}]` : '';
    const title = `${track.title}${typeInfo} — ${djDisplay}`;
    const description = `${track.genre || 'Electronic'}${bpmInfo}${keyInfo} | Escúchalo y descárgalo en ONLYDJS — La plataforma de DJs profesionales.`;
    const durationSecs = track.durationSeconds || 0;
    
    return `<!DOCTYPE html>
<html prefix="og: https://ogp.me/ns# music: https://ogp.me/ns/music#">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <!-- Open Graph -->
  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1200">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="ONLYDJS">
  <meta property="og:locale" content="es_MX">
  ${track.audioFileUrl ? `<meta property="og:audio" content="${track.audioFileUrl}">` : ''}
  ${track.audioFileUrl ? `<meta property="og:audio:type" content="audio/mpeg">` : ''}
  <meta property="music:musician" content="${djDisplay}">
  ${durationSecs ? `<meta property="music:duration" content="${durationSecs}">` : ''}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:site" content="@onlydjss">
  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Redirect to SPA for real users -->
  <meta http-equiv="refresh" content="0; url=${canonicalUrl}">
</head>
<body>
  <p>Redirigiendo a <a href="${canonicalUrl}">${title}</a>...</p>
</body>
</html>`;
  };

  // SSR OG handler for /track/:id
  app.get('/track/:id', async (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();
    try {
      const { getTrackById } = await import('../db');
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return next();
      const track = await getTrackById(trackId);
      if (!track) return res.status(404).send('Track not found');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
      return res.send(buildOgHtml(track));
    } catch (e) {
      return next();
    }
  });

  // SSR OG handler for /dj/:username/track/:id (canonical URL)
  app.get('/dj/:username/track/:id', async (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();
    try {
      const { getTrackById } = await import('../db');
      const trackId = parseInt(req.params.id);
      if (isNaN(trackId)) return next();
      const track = await getTrackById(trackId);
      if (!track) return res.status(404).send('Track not found');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
      return res.send(buildOgHtml(track));
    } catch (e) {
      return next();
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
