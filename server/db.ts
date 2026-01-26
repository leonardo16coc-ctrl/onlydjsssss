import { eq, desc, and, gte, lte, sql, or, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, tracks, Track, InsertTrack, downloads, InsertDownload,
  wallets, Wallet, InsertWallet, earnings, InsertEarning, playlists, InsertPlaylist,
  playlistTracks, InsertPlaylistTrack, likes, InsertLike, fraudLogs, InsertFraudLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "djName", "bio", "avatarUrl", "country"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserMembership(userId: number, data: {
  membershipStatus: "free" | "member" | "verified";
  membershipExpiresAt?: Date | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============= TRACK FUNCTIONS =============

export async function createTrack(track: InsertTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tracks).values(track);
  return result;
}

export async function getTrackById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTracksByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tracks)
    .where(eq(tracks.userId, userId))
    .orderBy(desc(tracks.createdAt))
    .limit(limit);
}

export async function getAllTracks(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tracks)
    .where(eq(tracks.status, "approved"))
    .orderBy(desc(tracks.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getTracksByGenre(genre: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tracks)
    .where(and(
      eq(tracks.genre, genre as any),
      eq(tracks.status, "approved")
    ))
    .orderBy(desc(tracks.createdAt))
    .limit(limit);
}

export async function getMainstageTracks(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tracks)
    .where(and(
      eq(tracks.isMainstage, true),
      eq(tracks.status, "approved")
    ))
    .orderBy(desc(tracks.downloadCount))
    .limit(limit);
}

export async function searchTracks(params: {
  query?: string;
  genre?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  trackType?: string;
  isMainstage?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(tracks.status, "approved")];
  
  if (params.query) {
    conditions.push(
      or(
        like(tracks.title, `%${params.query}%`),
        like(tracks.artist, `%${params.query}%`)
      ) as any
    );
  }
  
  if (params.genre) {
    conditions.push(eq(tracks.genre, params.genre as any));
  }
  
  if (params.bpmMin) {
    conditions.push(gte(tracks.bpm, params.bpmMin));
  }
  
  if (params.bpmMax) {
    conditions.push(lte(tracks.bpm, params.bpmMax));
  }
  
  if (params.key) {
    conditions.push(eq(tracks.musicalKey, params.key));
  }
  
  if (params.trackType) {
    conditions.push(eq(tracks.trackType, params.trackType as any));
  }
  
  if (params.isMainstage !== undefined) {
    conditions.push(eq(tracks.isMainstage, params.isMainstage));
  }
  
  return await db.select().from(tracks)
    .where(and(...conditions))
    .orderBy(desc(tracks.downloadCount))
    .limit(params.limit || 50);
}

export async function incrementTrackDownloads(trackId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(tracks)
    .set({ downloadCount: sql`${tracks.downloadCount} + 1` })
    .where(eq(tracks.id, trackId));
}

export async function incrementTrackPlays(trackId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(tracks)
    .set({ playCount: sql`${tracks.playCount} + 1` })
    .where(eq(tracks.id, trackId));
}

// ============= DOWNLOAD FUNCTIONS =============

export async function recordDownload(download: InsertDownload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(downloads).values(download);
  await incrementTrackDownloads(download.trackId);
}

export async function getDownloadsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.downloadedAt))
    .limit(limit);
}

export async function getDownloadsByArtist(artistId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(downloads)
    .where(eq(downloads.artistId, artistId))
    .orderBy(desc(downloads.downloadedAt))
    .limit(limit);
}

export async function getDownloadStats(artistId: number, month: string) {
  const db = await getDb();
  if (!db) return { total: 0 };
  
  const startDate = new Date(month + "-01");
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  
  const result = await db.select({
    total: sql<number>`COUNT(*)`
  }).from(downloads)
    .where(and(
      eq(downloads.artistId, artistId),
      gte(downloads.downloadedAt, startDate),
      lte(downloads.downloadedAt, endDate)
    ));
  
  return { total: result[0]?.total || 0 };
}

// ============= WALLET FUNCTIONS =============

export async function getOrCreateWallet(userId: number): Promise<Wallet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0]!;
  }
  
  await db.insert(wallets).values({ userId });
  const newWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return newWallet[0]!;
}

export async function updateWalletBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(wallets)
    .set({
      availableBalance: sql`${wallets.availableBalance} + ${amount}`,
      totalEarnings: sql`${wallets.totalEarnings} + ${amount}`
    })
    .where(eq(wallets.userId, userId));
}

// ============= EARNINGS FUNCTIONS =============

export async function createEarning(earning: InsertEarning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(earnings).values(earning);
}

export async function getEarningsByUser(userId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(earnings)
    .where(eq(earnings.userId, userId))
    .orderBy(desc(earnings.month))
    .limit(limit);
}

// ============= PLAYLIST FUNCTIONS =============

export async function createPlaylist(playlist: InsertPlaylist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(playlists).values(playlist);
  return result;
}

export async function getPlaylistsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(playlists)
    .where(eq(playlists.userId, userId))
    .orderBy(desc(playlists.updatedAt));
}

// ============= LIKES FUNCTIONS =============

export async function toggleLike(userId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.trackId, trackId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(likes).where(eq(likes.id, existing[0]!.id));
    await db.update(tracks)
      .set({ likeCount: sql`${tracks.likeCount} - 1` })
      .where(eq(tracks.id, trackId));
    return false;
  } else {
    await db.insert(likes).values({ userId, trackId });
    await db.update(tracks)
      .set({ likeCount: sql`${tracks.likeCount} + 1` })
      .where(eq(tracks.id, trackId));
    return true;
  }
}

export async function getUserLikes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(likes)
    .where(eq(likes.userId, userId))
    .orderBy(desc(likes.likedAt));
}

// ============= RANKING FUNCTIONS =============

export async function getTopDJs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users)
    .where(eq(users.membershipStatus, "member"))
    .orderBy(desc(users.totalDownloads))
    .limit(limit);
}

export async function getTrendingTracks(days = 7, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  
  return await db.select().from(tracks)
    .where(and(
      eq(tracks.status, "approved"),
      gte(tracks.createdAt, sinceDate)
    ))
    .orderBy(desc(tracks.downloadCount))
    .limit(limit);
}

// ============= FRAUD DETECTION =============

export async function logFraudAttempt(log: InsertFraudLog) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(fraudLogs).values(log);
}

export async function checkIPDownloadLimit(ipAddress: string, hours = 24): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - hours);
  
  const result = await db.select({
    count: sql<number>`COUNT(*)`
  }).from(downloads)
    .where(and(
      eq(downloads.ipAddress, ipAddress),
      gte(downloads.downloadedAt, sinceDate)
    ));
  
  return result[0]?.count || 0;
}
