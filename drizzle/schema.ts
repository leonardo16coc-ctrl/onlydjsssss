import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Membership fields
  membershipStatus: mysqlEnum("membershipStatus", ["free", "member", "verified"]).default("free").notNull(),
  membershipExpiresAt: timestamp("membershipExpiresAt"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  // DJ profile fields
  username: varchar("username", { length: 50 }).unique(),
  djName: text("djName"),
  bio: text("bio"),
  profileImageUrl: text("profileImageUrl"),
  profileImageKey: text("profileImageKey"),
  avatarUrl: text("avatarUrl"),
  country: varchar("country", { length: 100 }),
  socialLinks: text("socialLinks"), // JSON string for Instagram, Twitter, etc.
  // Verification
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  // Stats
  totalDownloads: int("totalDownloads").default(0).notNull(),
  totalUploads: int("totalUploads").default(0).notNull(),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  membershipStatusIdx: index("membership_status_idx").on(table.membershipStatus),
  totalDownloadsIdx: index("total_downloads_idx").on(table.totalDownloads),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tracks table - stores all music tracks
 */
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Basic info
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  // Audio files
  audioFileKey: text("audioFileKey").notNull(), // S3 key for original file
  audioFileUrl: text("audioFileUrl").notNull(), // S3 URL
  previewFileKey: text("previewFileKey"), // S3 key for 90s preview
  previewFileUrl: text("previewFileUrl"), // S3 URL for preview
  waveformData: text("waveformData"), // JSON waveform data
  coverImageKey: text("coverImageKey"),
  coverImageUrl: text("coverImageUrl"),
  // Metadata
  bpm: int("bpm"),
  musicalKey: varchar("musicalKey", { length: 10 }), // e.g., "Am", "C#m"
  genre: mysqlEnum("genre", [
    "Tech House",
    "Bass House", 
    "Afro House",
    "Techno",
    "Melodic Techno",
    "Big Room",
    "EDM",
    "Hard Techno",
    "Latin",
    "Reggaeton",
    "Hip-Hop",
    "Open Format"
  ]).notNull(),
  subgenre: varchar("subgenre", { length: 100 }),
  trackType: mysqlEnum("trackType", ["Extended Mix", "Edit", "Mashup", "Remix", "Rework"]).notNull(),
  energy: int("energy"), // 1-10 scale
  mood: varchar("mood", { length: 100 }),
  tags: text("tags"), // JSON array of tags
  // File info
  fileFormat: varchar("fileFormat", { length: 20 }), // MP3, WAV
  fileSizeBytes: bigint("fileSizeBytes", { mode: "number" }),
  durationSeconds: int("durationSeconds"),
  // AI Analysis
  hasDrops: boolean("hasDrops").default(false),
  dropsTimestamps: text("dropsTimestamps"), // JSON array
  buildsTimestamps: text("buildsTimestamps"), // JSON array
  // Mainstage classification
  isMainstage: boolean("isMainstage").default(false).notNull(),
  mainstageCategory: mysqlEnum("mainstageCategory", [
    "Tech House Mainstage",
    "Bass House Mainstage",
    "Techno Mainstage",
    "Melodic Techno Mainstage",
    "Big Room",
    "EDM Festival",
    "Hard Techno",
    "Latin Mainstage",
    "Reggaeton Mainstage",
    "Hip-Hop Mainstage"
  ]),
  mainstageTags: text("mainstageTags"), // JSON: Festival Weapon, Peak Time, etc.
  // Stats
  downloadCount: int("downloadCount").default(0).notNull(),
  playCount: int("playCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  genreIdx: index("genre_idx").on(table.genre),
  bpmIdx: index("bpm_idx").on(table.bpm),
  musicalKeyIdx: index("musical_key_idx").on(table.musicalKey),
  isMainstageIdx: index("is_mainstage_idx").on(table.isMainstage),
  downloadCountIdx: index("download_count_idx").on(table.downloadCount),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

/**
 * Downloads table - tracks every download for monetization
 */
export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Who downloaded
  trackId: int("trackId").notNull(), // What track
  artistId: int("artistId").notNull(), // Track owner (for revenue)
  // Analytics
  ipAddress: varchar("ipAddress", { length: 45 }),
  country: varchar("country", { length: 100 }),
  device: varchar("device", { length: 100 }),
  userAgent: text("userAgent"),
  // Fraud detection
  isSuspicious: boolean("isSuspicious").default(false),
  // Timestamp
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("download_user_id_idx").on(table.userId),
  trackIdIdx: index("download_track_id_idx").on(table.trackId),
  artistIdIdx: index("download_artist_id_idx").on(table.artistId),
  downloadedAtIdx: index("downloaded_at_idx").on(table.downloadedAt),
}));

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

/**
 * DJ Wallets - stores earnings and balance
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Balance
  availableBalance: decimal("availableBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  pendingBalance: decimal("pendingBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalWithdrawn: decimal("totalWithdrawn", { precision: 10, scale: 2 }).default("0.00").notNull(),
  // Payout methods
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("wallet_user_id_idx").on(table.userId),
}));

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Earnings history - monthly revenue distribution
 */
export const earnings = mysqlTable("earnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  // Revenue calculation
  totalDownloads: int("totalDownloads").default(0).notNull(),
  platformDownloads: int("platformDownloads").default(0).notNull(), // Total downloads on platform
  revenuePool: decimal("revenuePool", { precision: 10, scale: 2 }).default("0.00").notNull(),
  djShare: decimal("djShare", { precision: 10, scale: 2 }).default("0.00").notNull(), // 60% of pool
  userEarnings: decimal("userEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("earnings_user_id_idx").on(table.userId),
  monthIdx: index("earnings_month_idx").on(table.month),
}));

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;

/**
 * Playlists
 */
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  isPublic: boolean("isPublic").default(false).notNull(),
  trackCount: int("trackCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("playlist_user_id_idx").on(table.userId),
}));

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * Playlist tracks - many-to-many relationship
 */
export const playlistTracks = mysqlTable("playlist_tracks", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  trackId: int("trackId").notNull(),
  position: int("position").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  playlistIdIdx: index("playlist_tracks_playlist_id_idx").on(table.playlistId),
  trackIdIdx: index("playlist_tracks_track_id_idx").on(table.trackId),
}));

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = typeof playlistTracks.$inferInsert;

/**
 * Likes/Favorites
 */
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackId: int("trackId").notNull(),
  likedAt: timestamp("likedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("likes_user_id_idx").on(table.userId),
  trackIdIdx: index("likes_track_id_idx").on(table.trackId),
}));

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Fraud detection logs
 */
export const fraudLogs = mysqlTable("fraud_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  action: varchar("action", { length: 100 }).notNull(), // download, upload, etc.
  reason: text("reason"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("fraud_user_id_idx").on(table.userId),
  ipAddressIdx: index("fraud_ip_idx").on(table.ipAddress),
  createdAtIdx: index("fraud_created_at_idx").on(table.createdAt),
}));

export type FraudLog = typeof fraudLogs.$inferSelect;
export type InsertFraudLog = typeof fraudLogs.$inferInsert;


/**
 * DJ Profiles - Perfil inteligente automático
 */
export const djProfiles = mysqlTable("dj_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Análisis automático
  totalTracksDownloaded: int("totalTracksDownloaded").default(0).notNull(),
  totalTracksPlayed: int("totalTracksPlayed").default(0).notNull(),
  // Géneros favoritos (JSON array de {genre: string, count: number})
  favoriteGenres: text("favoriteGenres"),
  // BPM preferences
  avgBpm: int("avgBpm"),
  minBpm: int("minBpm"),
  maxBpm: int("maxBpm"),
  // Key preferences (JSON array de {key: string, count: number})
  favoriteKeys: text("favoriteKeys"),
  // Energía promedio (0-100)
  avgEnergy: int("avgEnergy"),
  // Mood preferences (JSON array)
  favoriteMoods: text("favoriteMoods"),
  // Actividad
  lastActivityAt: timestamp("lastActivityAt"),
  profileScore: int("profileScore").default(0).notNull(), // Score de completitud del perfil
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("dj_profile_user_id_idx").on(table.userId),
  profileScoreIdx: index("dj_profile_score_idx").on(table.profileScore),
}));

export type DjProfile = typeof djProfiles.$inferSelect;
export type InsertDjProfile = typeof djProfiles.$inferInsert;

/**
 * DJ Activity - Tracking de comportamiento para análisis
 */
export const djActivity = mysqlTable("dj_activity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackId: int("trackId").notNull(),
  activityType: mysqlEnum("activityType", ["download", "play", "like", "add_to_playlist"]).notNull(),
  // Metadatos del track en el momento de la actividad
  trackBpm: int("trackBpm"),
  trackKey: varchar("trackKey", { length: 10 }),
  trackGenre: varchar("trackGenre", { length: 100 }),
  trackEnergy: int("trackEnergy"),
  trackMood: varchar("trackMood", { length: 100 }),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("dj_activity_user_id_idx").on(table.userId),
  trackIdIdx: index("dj_activity_track_id_idx").on(table.trackId),
  activityTypeIdx: index("dj_activity_type_idx").on(table.activityType),
  createdAtIdx: index("dj_activity_created_at_idx").on(table.createdAt),
}));

export type DjActivity = typeof djActivity.$inferSelect;
export type InsertDjActivity = typeof djActivity.$inferInsert;

/**
 * Auto Sets - Sets generados automáticamente
 */
export const autoSets = mysqlTable("auto_sets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  setType: mysqlEnum("setType", ["warmup", "peak_time", "closing", "festival"]).notNull(),
  // Análisis del set
  avgBpm: int("avgBpm"),
  keyCompatibility: int("keyCompatibility"), // Score 0-100
  energyCurve: text("energyCurve"), // JSON array de energía por track
  // Tracks del set (JSON array de track IDs con orden)
  trackIds: text("trackIds").notNull(),
  trackCount: int("trackCount").default(0).notNull(),
  // Sugerencias de transiciones (JSON)
  transitions: text("transitions"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("auto_sets_user_id_idx").on(table.userId),
  setTypeIdx: index("auto_sets_type_idx").on(table.setType),
}));

export type AutoSet = typeof autoSets.$inferSelect;
export type InsertAutoSet = typeof autoSets.$inferInsert;
