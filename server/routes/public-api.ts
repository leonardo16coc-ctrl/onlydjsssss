/**
 * ONLYDJS Public REST API v1
 * ──────────────────────────────────────────────────────────────────────────
 * Endpoints available at /api/v1/*
 * CORS is fully open so any external website can consume these endpoints.
 *
 * Endpoints:
 *   GET /api/v1/tracks              – Paginated track list (discover/explore)
 *   GET /api/v1/tracks/:id          – Single track detail
 *   GET /api/v1/tracks/dj/:username – Tracks by a specific DJ
 *   GET /api/v1/djs                 – Paginated DJ list
 *   GET /api/v1/djs/:username       – Single DJ profile
 *   GET /api/v1/search              – Full-text search across tracks and DJs
 *   GET /api/v1/genres              – Available genre list
 *   GET /api/v1/health              – API health check
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const publicApiRouter = Router();

// ── CORS middleware (open to all origins) ────────────────────────────────────
publicApiRouter.use((_req: Request, res: Response, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  next();
});

publicApiRouter.options("*", (_req, res) => res.sendStatus(204));

// ── Helpers ──────────────────────────────────────────────────────────────────
const SITE_URL = "https://www.onlydjss.com";

function trackUrl(username: string | null, id: number) {
  return username
    ? `${SITE_URL}/dj/${username}/track/${id}`
    : `${SITE_URL}/track/${id}`;
}

function djUrl(username: string) {
  return `${SITE_URL}/${username}`;
}

function parsePagination(query: Record<string, any>) {
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
}

function formatTrack(row: any) {
  return {
    id:            row.id,
    title:         row.title,
    artist:        row.artist,
    genre:         row.genre,
    subgenre:      row.subgenre || null,
    trackType:     row.trackType,
    bpm:           row.bpm ? Number(row.bpm) : null,
    musicalKey:    row.musicalKey || null,
    energy:        row.energy ? Number(row.energy) : null,
    durationSeconds: row.durationSeconds ? Number(row.durationSeconds) : null,
    coverImageUrl: row.coverImageUrl || null,
    previewUrl:    row.previewFileUrl || null,
    stats: {
      downloads: Number(row.downloadCount || 0),
      streams:   Number(row.streamCount   || 0),
      likes:     Number(row.likeCount     || 0),
    },
    dj: {
      id:       row.userId,
      username: row.username || null,
      djName:   row.djName   || row.name || null,
      avatarUrl: row.avatarUrl || null,
    },
    url:       trackUrl(row.username, row.id),
    createdAt: row.createdAt,
  };
}

function formatDJ(row: any) {
  return {
    id:             row.id,
    username:       row.username,
    djName:         row.djName || row.name || null,
    bio:            row.bio    || null,
    country:        row.country || null,
    avatarUrl:      row.avatarUrl || row.profileImageUrl || null,
    isVerified:     Boolean(row.isVerified),
    membershipStatus: row.membershipStatus || "free",
    stats: {
      followers: Number(row.followers_count || 0),
      following: Number(row.following_count || 0),
      tracks:    Number(row.track_count     || 0),
    },
    url: djUrl(row.username),
  };
}

// ── GET /api/v1/health ────────────────────────────────────────────────────────
publicApiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", version: "1.0", timestamp: new Date().toISOString() });
});

// ── GET /api/v1/genres ────────────────────────────────────────────────────────
publicApiRouter.get("/genres", (_req: Request, res: Response) => {
  res.json({
    genres: [
      "Tech House", "Bass House", "Afro House", "Techno", "Melodic Techno",
      "Big Room", "EDM", "Hard Techno", "Latin", "Reggaeton", "Hip-Hop", "Open Format",
    ],
    trackTypes: ["Extended Mix", "Edit", "Mashup", "Remix", "Rework"],
  });
});

// ── GET /api/v1/tracks ────────────────────────────────────────────────────────
publicApiRouter.get("/tracks", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const { limit, page, offset } = parsePagination(req.query);
    const genre     = req.query.genre     as string | undefined;
    const trackType = req.query.trackType as string | undefined;
    const sort      = (req.query.sort as string) || "newest"; // newest | popular | trending

    let orderClause = "t.createdAt DESC";
    if (sort === "popular")  orderClause = "t.downloadCount DESC, t.streamCount DESC";
    if (sort === "trending") orderClause = "t.streamCount DESC, t.likeCount DESC";

    const genreFilter     = genre     ? sql`AND t.genre = ${genre}`     : sql``;
    const trackTypeFilter = trackType ? sql`AND t.trackType = ${trackType}` : sql``;

    const rows = await db.execute(sql`
      SELECT t.*, u.username, u.djName, u.name, u.avatarUrl
      FROM tracks t
      LEFT JOIN users u ON u.id = t.userId
      WHERE t.status = 'approved'
        ${genreFilter}
        ${trackTypeFilter}
      ORDER BY ${sql.raw(orderClause)}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countRows = await db.execute(sql`
      SELECT COUNT(*) as total FROM tracks t
      WHERE t.status = 'approved'
        ${genreFilter}
        ${trackTypeFilter}
    `);

    const data  = Array.isArray((rows as any[])[0]) ? (rows as any[])[0] : (rows as any[]);
    const cData = Array.isArray((countRows as any[])[0]) ? (countRows as any[])[0] : (countRows as any[]);
    const total = Number(cData[0]?.total || 0);

    return res.json({
      data:       data.map(formatTrack),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[PublicAPI] GET /tracks error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/v1/tracks/:id ────────────────────────────────────────────────────
publicApiRouter.get("/tracks/:id", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid track ID" });

    const rows = await db.execute(sql`
      SELECT t.*, u.username, u.djName, u.name, u.avatarUrl
      FROM tracks t
      LEFT JOIN users u ON u.id = t.userId
      WHERE t.id = ${id} AND t.status = 'approved'
      LIMIT 1
    `);

    const data = Array.isArray((rows as any[])[0]) ? (rows as any[])[0] : (rows as any[]);
    if (!data[0]) return res.status(404).json({ error: "Track not found" });

    return res.json({ data: formatTrack(data[0]) });
  } catch (err) {
    console.error("[PublicAPI] GET /tracks/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/v1/tracks/dj/:username ──────────────────────────────────────────
publicApiRouter.get("/tracks/dj/:username", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const { username } = req.params;
    const { limit, page, offset } = parsePagination(req.query);
    const trackType = req.query.trackType as string | undefined;
    const trackTypeFilter = trackType ? sql`AND t.trackType = ${trackType}` : sql``;

    const rows = await db.execute(sql`
      SELECT t.*, u.username, u.djName, u.name, u.avatarUrl
      FROM tracks t
      JOIN users u ON u.id = t.userId
      WHERE u.username = ${username} AND t.status = 'approved'
        ${trackTypeFilter}
      ORDER BY t.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countRows = await db.execute(sql`
      SELECT COUNT(*) as total FROM tracks t
      JOIN users u ON u.id = t.userId
      WHERE u.username = ${username} AND t.status = 'approved'
        ${trackTypeFilter}
    `);

    const data  = Array.isArray((rows as any[])[0]) ? (rows as any[])[0] : (rows as any[]);
    const cData = Array.isArray((countRows as any[])[0]) ? (countRows as any[])[0] : (countRows as any[]);
    const total = Number(cData[0]?.total || 0);

    if (data.length === 0 && page === 1) {
      // Check if DJ exists
      const djCheck = await db.execute(sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`);
      const djData  = Array.isArray((djCheck as any[])[0]) ? (djCheck as any[])[0] : (djCheck as any[]);
      if (!djData[0]) return res.status(404).json({ error: "DJ not found" });
    }

    return res.json({
      data:       data.map(formatTrack),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[PublicAPI] GET /tracks/dj/:username error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/v1/djs ───────────────────────────────────────────────────────────
publicApiRouter.get("/djs", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const { limit, page, offset } = parsePagination(req.query);
    const sort = (req.query.sort as string) || "popular"; // popular | newest

    let orderClause = "(SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) DESC";
    if (sort === "newest") orderClause = "u.createdAt DESC";

    const rows = await db.execute(sql`
      SELECT u.*,
        (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
        (SELECT COUNT(*) FROM dj_followers WHERE followerId  = u.id) as following_count,
        (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
      FROM users u
      WHERE u.username IS NOT NULL
      ORDER BY ${sql.raw(orderClause)}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countRows = await db.execute(sql`
      SELECT COUNT(*) as total FROM users WHERE username IS NOT NULL
    `);

    const data  = Array.isArray((rows as any[])[0]) ? (rows as any[])[0] : (rows as any[]);
    const cData = Array.isArray((countRows as any[])[0]) ? (countRows as any[])[0] : (countRows as any[]);
    const total = Number(cData[0]?.total || 0);

    return res.json({
      data:       data.map(formatDJ),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[PublicAPI] GET /djs error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/v1/djs/:username ─────────────────────────────────────────────────
publicApiRouter.get("/djs/:username", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const { username } = req.params;
    const rows = await db.execute(sql`
      SELECT u.*,
        (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
        (SELECT COUNT(*) FROM dj_followers WHERE followerId  = u.id) as following_count,
        (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
      FROM users u
      WHERE u.username = ${username}
      LIMIT 1
    `);

    const data = Array.isArray((rows as any[])[0]) ? (rows as any[])[0] : (rows as any[]);
    if (!data[0]) return res.status(404).json({ error: "DJ not found" });

    return res.json({ data: formatDJ(data[0]) });
  } catch (err) {
    console.error("[PublicAPI] GET /djs/:username error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/v1/search ────────────────────────────────────────────────────────
publicApiRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters" });
    }

    const like = `%${q}%`;
    const { limit } = parsePagination(req.query);

    const trackRows = await db.execute(sql`
      SELECT t.*, u.username, u.djName, u.name, u.avatarUrl
      FROM tracks t
      LEFT JOIN users u ON u.id = t.userId
      WHERE t.status = 'approved'
        AND (t.title LIKE ${like} OR t.artist LIKE ${like} OR t.genre LIKE ${like})
      ORDER BY t.downloadCount DESC
      LIMIT ${Math.min(limit, 20)}
    `);

    const djRows = await db.execute(sql`
      SELECT u.*,
        (SELECT COUNT(*) FROM dj_followers WHERE followingId = u.id) as followers_count,
        (SELECT COUNT(*) FROM dj_followers WHERE followerId  = u.id) as following_count,
        (SELECT COUNT(*) FROM tracks WHERE userId = u.id AND status = 'approved') as track_count
      FROM users u
      WHERE u.username IS NOT NULL
        AND (u.djName LIKE ${like} OR u.name LIKE ${like} OR u.username LIKE ${like})
      ORDER BY followers_count DESC
      LIMIT 10
    `);

    const tracks = Array.isArray((trackRows as any[])[0]) ? (trackRows as any[])[0] : (trackRows as any[]);
    const djs    = Array.isArray((djRows   as any[])[0]) ? (djRows   as any[])[0] : (djRows   as any[]);

    return res.json({
      query: q,
      data: {
        tracks: tracks.map(formatTrack),
        djs:    djs.map(formatDJ),
      },
    });
  } catch (err) {
    console.error("[PublicAPI] GET /search error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
