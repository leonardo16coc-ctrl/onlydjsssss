import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint, index, json } from "drizzle-orm/mysql-core";

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
  stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }),
  // Sellfy integration
  sellfyCustomerId: varchar("sellfyCustomerId", { length: 255 }),
  sellfySubscriptionId: varchar("sellfySubscriptionId", { length: 255 }),
  sellfySubscriptionStatus: mysqlEnum("sellfySubscriptionStatus", ["active", "cancelled", "expired", "pending"]),
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
  playCount: int("playCount").default(0).notNull(), // Legacy field (kept for compatibility)
  streamCount: int("streamCount").default(0).notNull(), // New: total streams (plays)
  minutesListened: int("minutesListened").default(0).notNull(), // New: total minutes listened
  likeCount: int("likeCount").default(0).notNull(),
  favoritesCount: int("favoritesCount").default(0).notNull(), // New: times added to favorites
  playlistsCount: int("playlistsCount").default(0).notNull(), // New: times added to playlists
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
  // Revenue calculation (NEW HYBRID MODEL: 50% DJs / 50% Platform)
  totalDownloads: int("totalDownloads").default(0).notNull(), // DJ's downloads this month
  totalStreams: int("totalStreams").default(0).notNull(), // DJ's streams this month
  totalMinutesListened: int("totalMinutesListened").default(0).notNull(), // DJ's minutes this month
  totalFavoritesPlaylists: int("totalFavoritesPlaylists").default(0).notNull(), // DJ's favorites+playlists
  djScore: decimal("djScore", { precision: 10, scale: 2 }).default("0.00").notNull(), // Calculated DJ Score
  platformDownloads: int("platformDownloads").default(0).notNull(), // Total downloads on platform
  platformTotalScore: decimal("platformTotalScore", { precision: 12, scale: 2 }).default("0.00").notNull(), // Sum of all DJ scores
  // Revenue pools (50% DJs / 50% Platform)
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0.00").notNull(), // Total monthly revenue
  poolDJs: decimal("poolDJs", { precision: 10, scale: 2 }).default("0.00").notNull(), // 50% for DJs
  poolDownloads: decimal("poolDownloads", { precision: 10, scale: 2 }).default("0.00").notNull(), // 30% of DJ pool
  poolScore: decimal("poolScore", { precision: 10, scale: 2 }).default("0.00").notNull(), // 20% of DJ pool
  valuePerDownload: decimal("valuePerDownload", { precision: 5, scale: 4 }).default("0.0000").notNull(), // Pool / total downloads
  // DJ earnings breakdown
  earningsFromDownloads: decimal("earningsFromDownloads", { precision: 10, scale: 2 }).default("0.00").notNull(),
  earningsFromScore: decimal("earningsFromScore", { precision: 10, scale: 2 }).default("0.00").notNull(),
  userEarnings: decimal("userEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(), // Total earnings
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
 * Track Earnings - Granular earnings per download
 */
export const trackEarnings = mysqlTable("track_earnings", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(), // FK a tracks
  artistId: int("artistId").notNull(), // FK a users (owner del track)
  downloadId: int("downloadId").notNull(), // FK a downloads
  downloaderId: int("downloaderId").notNull(), // FK a users (quien descargó)
  // Revenue calculation
  revenuePerDownload: decimal("revenuePerDownload", { precision: 5, scale: 2 }).default("0.50").notNull(), // $0.50 per download
  artistShare: decimal("artistShare", { precision: 5, scale: 2 }).default("0.30").notNull(), // 60% = $0.30
  platformShare: decimal("platformShare", { precision: 5, scale: 2 }).default("0.20").notNull(), // 40% = $0.20
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_earnings_track_id_idx").on(table.trackId),
  artistIdIdx: index("track_earnings_artist_id_idx").on(table.artistId),
  downloadIdIdx: index("track_earnings_download_id_idx").on(table.downloadId),
  createdAtIdx: index("track_earnings_created_at_idx").on(table.createdAt),
}));

export type TrackEarning = typeof trackEarnings.$inferSelect;
export type InsertTrackEarning = typeof trackEarnings.$inferInsert;

/**
 * Artist Payouts - Payment history for artists
 */
export const artistPayouts = mysqlTable("artist_payouts", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull(), // FK a users
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Total payout amount
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  // Payment method
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "paypal", "bank_transfer"]).notNull(),
  stripeTransferId: varchar("stripeTransferId", { length: 255 }), // Stripe transfer ID
  paypalTransactionId: varchar("paypalTransactionId", { length: 255 }), // PayPal transaction ID
  // Period covered
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  // Metadata
  totalDownloads: int("totalDownloads").default(0).notNull(), // Downloads in this period
  notes: text("notes"), // Admin notes
  // Timestamps
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_payouts_artist_id_idx").on(table.artistId),
  statusIdx: index("artist_payouts_status_idx").on(table.status),
  createdAtIdx: index("artist_payouts_created_at_idx").on(table.createdAt),
}));

export type ArtistPayout = typeof artistPayouts.$inferSelect;
export type InsertArtistPayout = typeof artistPayouts.$inferInsert;

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

/**
 * DJ Badges - Sistema de gamificación
 */
export const djBadges = mysqlTable("dj_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: mysqlEnum("badgeType", [
    "club_killer",
    "festival_weapon",
    "peak_time_master",
    "ai_power_dj",
    "verified_dj",
    "precision_master",
    "rising_star",
    "top_10_dj",
    "sound_designer",
    "bass_lord",
  ]).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  progress: int("progress").default(0).notNull(), // Progreso hacia el badge (0-100)
}, (table) => ({
  userIdIdx: index("dj_badges_user_id_idx").on(table.userId),
  badgeTypeIdx: index("dj_badges_type_idx").on(table.badgeType),
  userBadgeUnique: index("dj_badges_user_badge_unique").on(table.userId, table.badgeType),
}));

export type DjBadge = typeof djBadges.$inferSelect;
export type InsertDjBadge = typeof djBadges.$inferInsert;


/**
 * Weekly Challenges - Retos semanales gamificados
 */
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStart: timestamp("weekStart").notNull(), // Lunes de la semana
  challengeType: mysqlEnum("challengeType", [
    "generate_sets", // Genera X sets
    "download_tracks", // Descarga X tracks
    "play_tracks", // Reproduce X tracks
    "upload_tracks", // Sube X tracks
    "reach_plays", // Alcanza X reproducciones en tus tracks
    "complete_profile", // Completa tu perfil al 100%
    "enter_rankings", // Entra al Top X de rankings
    "gain_followers", // Consigue X nuevos seguidores
    "use_dj_mode", // Usa DJ MODE X días seguidos
    "genre_specialist", // Descarga X tracks de un solo género
  ]).notNull(),
  targetValue: int("targetValue").notNull(), // Valor objetivo (ej: 2 sets, 10 tracks)
  currentValue: int("currentValue").default(0).notNull(), // Progreso actual
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  badgeAwarded: varchar("badgeAwarded", { length: 50 }), // Badge exclusivo al completar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("weekly_challenges_user_id_idx").on(table.userId),
  weekStartIdx: index("weekly_challenges_week_idx").on(table.weekStart),
  userWeekUnique: index("weekly_challenges_user_week_unique").on(table.userId, table.weekStart, table.challengeType),
}));

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = typeof weeklyChallenges.$inferInsert;


/**
 * Set Feedback - Sistema de calificación y comentarios de sets generados
 */
export const setFeedback = mysqlTable("set_feedback", {
  id: int("id").autoincrement().primaryKey(),
  setId: int("setId").notNull(), // FK a auto_sets
  userId: int("userId").notNull(), // FK a users
  rating: int("rating").notNull(), // 1-5 estrellas
  comment: text("comment"), // Comentario libre
  workedWell: json("workedWell").$type<string[]>(), // Tags: ["transiciones", "energía", "compatibilidad", "flow"]
  needsImprovement: json("needsImprovement").$type<string[]>(), // Tags: ["BPM", "key", "orden", "duración"]
  usedInLive: boolean("usedInLive").default(false).notNull(), // ¿Lo usaste en vivo?
  venueType: mysqlEnum("venueType", ["club", "festival", "bar", "radio", "stream", "other"]), // Tipo de venue
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  setIdIdx: index("set_feedback_set_id_idx").on(table.setId),
  userIdIdx: index("set_feedback_user_id_idx").on(table.userId),
  userSetUnique: index("set_feedback_user_set_unique").on(table.userId, table.setId),
}));

export type SetFeedback = typeof setFeedback.$inferSelect;
export type InsertSetFeedback = typeof setFeedback.$inferInsert;


/**
 * DNA Share Analytics - Tracking de shares de DJ DNA por formato y plataforma
 */
export const dnaShareAnalytics = mysqlTable("dna_share_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK a users
  format: mysqlEnum("format", ["story", "square", "banner"]).notNull(), // Formato de exportación
  platform: mysqlEnum("platform", ["download", "twitter", "facebook", "whatsapp", "copy"]).notNull(), // Plataforma de share
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("dna_share_analytics_user_id_idx").on(table.userId),
  formatIdx: index("dna_share_analytics_format_idx").on(table.format),
  platformIdx: index("dna_share_analytics_platform_idx").on(table.platform),
  createdAtIdx: index("dna_share_analytics_created_at_idx").on(table.createdAt),
}));

export type DNAShareAnalytics = typeof dnaShareAnalytics.$inferSelect;
export type InsertDNAShareAnalytics = typeof dnaShareAnalytics.$inferInsert;


/**
 * Track Festival Scores - Sistema de scores inteligentes para MAINSTAGE MODE
 */
export const trackFestivalScores = mysqlTable("track_festival_scores", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(), // FK a tracks
  festivalScore: int("festivalScore").notNull().default(0), // 0-100
  peakTimeScore: int("peakTimeScore").notNull().default(0), // 0-100
  dropImpactScore: int("dropImpactScore").notNull().default(0), // 0-100
  crowdEnergyScore: int("crowdEnergyScore").notNull().default(0), // 0-100
  mainstageCompatibilityScore: int("mainstageCompatibilityScore").notNull().default(0), // 0-100
  // Crowd Impact Prediction metrics
  crowdImpactScore: int("crowdImpactScore").notNull().default(0), // 0-100
  dropExplosionProbability: int("dropExplosionProbability").notNull().default(0), // 0-100 (%)
  handsUpProbability: int("handsUpProbability").notNull().default(0), // 0-100 (%)
  energyRetention: int("energyRetention").notNull().default(0), // 0-100 (%)
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_festival_scores_track_id_idx").on(table.trackId),
  festivalScoreIdx: index("track_festival_scores_festival_score_idx").on(table.festivalScore),
  peakTimeScoreIdx: index("track_festival_scores_peak_time_score_idx").on(table.peakTimeScore),
  dropImpactScoreIdx: index("track_festival_scores_drop_impact_score_idx").on(table.dropImpactScore),
  mainstageCompatibilityScoreIdx: index("track_festival_scores_mainstage_compatibility_score_idx").on(table.mainstageCompatibilityScore),
}));

export type TrackFestivalScores = typeof trackFestivalScores.$inferSelect;
export type InsertTrackFestivalScores = typeof trackFestivalScores.$inferInsert;


/**
 * Subscriptions - Stripe subscription management
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "unpaid", "trialing"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Download Limits - Daily download tracking per user
 */
export const downloadLimits = mysqlTable("download_limits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  downloadsCount: int("downloadsCount").default(0).notNull(),
  // Track-specific limits
  trackDownloads: text("trackDownloads"), // JSON: {trackId: count}
  lastResetAt: timestamp("lastResetAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("download_limits_user_id_idx").on(table.userId),
  dateIdx: index("download_limits_date_idx").on(table.date),
  userDateUnique: index("download_limits_user_date_unique").on(table.userId, table.date),
}));

export type DownloadLimit = typeof downloadLimits.$inferSelect;
export type InsertDownloadLimit = typeof downloadLimits.$inferInsert;

/**
 * Monthly Revenue Pools - Monthly revenue distribution pools
 */
export const monthlyRevenuePools = mysqlTable("monthly_revenue_pools", {
  id: int("id").autoincrement().primaryKey(),
  month: varchar("month", { length: 7 }).notNull().unique(), // YYYY-MM
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0.00").notNull(),
  platformShare: decimal("platformShare", { precision: 12, scale: 2 }).default("0.00").notNull(), // 50%
  djsShare: decimal("djsShare", { precision: 12, scale: 2 }).default("0.00").notNull(), // 50%
  downloadsPool: decimal("downloadsPool", { precision: 12, scale: 2 }).default("0.00").notNull(), // 30% of DJs share
  scorePool: decimal("scorePool", { precision: 12, scale: 2 }).default("0.00").notNull(), // 20% of DJs share
  totalDownloads: int("totalDownloads").default(0).notNull(),
  totalDJScore: decimal("totalDJScore", { precision: 12, scale: 2 }).default("0.00").notNull(),
  valuePerDownload: decimal("valuePerDownload", { precision: 8, scale: 4 }).default("0.0000").notNull(),
  status: mysqlEnum("status", ["calculating", "completed", "paid"]).default("calculating").notNull(),
  calculatedAt: timestamp("calculatedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  monthIdx: index("monthly_revenue_pools_month_idx").on(table.month),
  statusIdx: index("monthly_revenue_pools_status_idx").on(table.status),
}));

export type MonthlyRevenuePool = typeof monthlyRevenuePools.$inferSelect;
export type InsertMonthlyRevenuePool = typeof monthlyRevenuePools.$inferInsert;

/**
 * DJ Scores - Monthly impact metrics for each DJ
 */
export const djScores = mysqlTable("dj_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  // Raw metrics
  totalDownloads: int("totalDownloads").default(0).notNull(),
  totalStreams: int("totalStreams").default(0).notNull(),
  totalMinutesListened: int("totalMinutesListened").default(0).notNull(),
  totalFavorites: int("totalFavorites").default(0).notNull(),
  totalPlaylistAdds: int("totalPlaylistAdds").default(0).notNull(),
  // Weighted scores (0-100 each)
  downloadsScore: decimal("downloadsScore", { precision: 8, scale: 2 }).default("0.00").notNull(), // 40%
  streamsScore: decimal("streamsScore", { precision: 8, scale: 2 }).default("0.00").notNull(), // 30%
  listeningTimeScore: decimal("listeningTimeScore", { precision: 8, scale: 2 }).default("0.00").notNull(), // 20%
  engagementScore: decimal("engagementScore", { precision: 8, scale: 2 }).default("0.00").notNull(), // 10%
  // Final DJ Score
  djScore: decimal("djScore", { precision: 10, scale: 2 }).default("0.00").notNull(),
  // Participation percentage
  participationPercentage: decimal("participationPercentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
  // Earnings
  downloadEarnings: decimal("downloadEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  scoreEarnings: decimal("scoreEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  calculatedAt: timestamp("calculatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("dj_scores_user_id_idx").on(table.userId),
  monthIdx: index("dj_scores_month_idx").on(table.month),
  djScoreIdx: index("dj_scores_dj_score_idx").on(table.djScore),
  userMonthUnique: index("dj_scores_user_month_unique").on(table.userId, table.month),
}));

export type DJScore = typeof djScores.$inferSelect;
export type InsertDJScore = typeof djScores.$inferInsert;

/**
 * Device Fingerprints - Anti-fraud device tracking
 */
export const deviceFingerprints = mysqlTable("device_fingerprints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  fingerprintHash: varchar("fingerprintHash", { length: 64 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  deviceType: varchar("deviceType", { length: 50 }),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  screenResolution: varchar("screenResolution", { length: 20 }),
  timezone: varchar("timezone", { length: 100 }),
  language: varchar("language", { length: 10 }),
  // VPN/Proxy detection
  isVPN: boolean("isVPN").default(false).notNull(),
  isProxy: boolean("isProxy").default(false).notNull(),
  isTor: boolean("isTor").default(false).notNull(),
  // Bot detection
  isBot: boolean("isBot").default(false).notNull(),
  botScore: int("botScore").default(0).notNull(), // 0-100
  // Fraud flags
  isSuspicious: boolean("isSuspicious").default(false).notNull(),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  blockReason: text("blockReason"),
  // Activity tracking
  firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  activityCount: int("activityCount").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("device_fingerprints_user_id_idx").on(table.userId),
  fingerprintHashIdx: index("device_fingerprints_hash_idx").on(table.fingerprintHash),
  ipAddressIdx: index("device_fingerprints_ip_idx").on(table.ipAddress),
  isSuspiciousIdx: index("device_fingerprints_suspicious_idx").on(table.isSuspicious),
}));

export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;
export type InsertDeviceFingerprint = typeof deviceFingerprints.$inferInsert;

/**
 * Streaming Activity - Track listening time for revenue calculation
 */
export const streamingActivity = mysqlTable("streaming_activity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Listener
  trackId: int("trackId").notNull(),
  artistId: int("artistId").notNull(), // Track owner
  // Listening metrics
  durationSeconds: int("durationSeconds").notNull(), // How long they listened
  completionPercentage: int("completionPercentage").notNull(), // 0-100
  // Session info
  sessionId: varchar("sessionId", { length: 64 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  device: varchar("device", { length: 100 }),
  // Fraud detection
  isSuspicious: boolean("isSuspicious").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("streaming_activity_user_id_idx").on(table.userId),
  trackIdIdx: index("streaming_activity_track_id_idx").on(table.trackId),
  artistIdIdx: index("streaming_activity_artist_id_idx").on(table.artistId),
  createdAtIdx: index("streaming_activity_created_at_idx").on(table.createdAt),
}));

export type StreamingActivity = typeof streamingActivity.$inferSelect;
export type InsertStreamingActivity = typeof streamingActivity.$inferInsert;

/**
 * Community Posts - User-generated content for community interaction
 */
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  // Optional track reference
  trackId: int("trackId"),
  // Engagement metrics
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("community_posts_user_id_idx").on(table.userId),
  createdAtIdx: index("community_posts_created_at_idx").on(table.createdAt),
}));

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Post Likes - Track which users liked which posts
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postIdIdx: index("post_likes_post_id_idx").on(table.postId),
  userIdIdx: index("post_likes_user_id_idx").on(table.userId),
  uniqueLike: index("post_likes_unique").on(table.postId, table.userId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Post Comments - Comments on community posts
 */
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdIdx: index("post_comments_post_id_idx").on(table.postId),
  userIdIdx: index("post_comments_user_id_idx").on(table.userId),
  createdAtIdx: index("post_comments_created_at_idx").on(table.createdAt),
}));

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

/**
 * DJ Leads - Potential DJs discovered by scout agents
 */
export const djLeads = mysqlTable("dj_leads", {
  id: int("id").autoincrement().primaryKey(),
  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  // Social profiles
  soundcloudUrl: text("soundcloudUrl"),
  beatportUrl: text("beatportUrl"),
  instagramUrl: text("instagramUrl"),
  spotifyUrl: text("spotifyUrl"),
  // Metrics
  followers: int("followers").default(0),
  totalTracks: int("totalTracks").default(0),
  avgPlays: int("avgPlays").default(0),
  // Classification
  primaryGenre: varchar("primaryGenre", { length: 100 }),
  subgenres: text("subgenres"), // JSON array
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  // Lead status
  status: mysqlEnum("status", ["new", "contacted", "responded", "registered", "uploaded", "rejected"]).default("new").notNull(),
  source: varchar("source", { length: 100 }).notNull(), // "soundcloud", "beatport", "instagram", "manual"
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  // Contact history
  lastContactedAt: timestamp("lastContactedAt"),
  contactCount: int("contactCount").default(0).notNull(),
  notes: text("notes"),
  // Invitation
  invitationCode: varchar("invitationCode", { length: 50 }).unique(),
  invitationSentAt: timestamp("invitationSentAt"),
  // Timestamps
  discoveredAt: timestamp("discoveredAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("dj_leads_status_idx").on(table.status),
  sourceIdx: index("dj_leads_source_idx").on(table.source),
  priorityIdx: index("dj_leads_priority_idx").on(table.priority),
  emailIdx: index("dj_leads_email_idx").on(table.email),
}));

export type DjLead = typeof djLeads.$inferSelect;
export type InsertDjLead = typeof djLeads.$inferInsert;

/**
 * DJ Followers - Users following other DJs
 */
export const djFollowers = mysqlTable("dj_followers", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(), // User who follows
  followingId: int("followingId").notNull(), // DJ being followed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("dj_followers_follower_idx").on(table.followerId),
  followingIdx: index("dj_followers_following_idx").on(table.followingId),
  uniqueFollow: index("dj_followers_unique").on(table.followerId, table.followingId),
}));
export type DjFollower = typeof djFollowers.$inferSelect;
export type InsertDjFollower = typeof djFollowers.$inferInsert;

/**
 * Track Reposts - Users reposting tracks to their profile
 */
export const trackReposts = mysqlTable("track_reposts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackId: int("trackId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("track_reposts_user_id_idx").on(table.userId),
  trackIdIdx: index("track_reposts_track_id_idx").on(table.trackId),
  uniqueRepost: index("track_reposts_unique").on(table.userId, table.trackId),
}));
export type TrackRepost = typeof trackReposts.$inferSelect;
export type InsertTrackRepost = typeof trackReposts.$inferInsert;

/**
 * Social Media Connections - OAuth tokens for Instagram, Facebook, TikTok, YouTube
 */
export const socialMediaConnections = mysqlTable("social_media_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "youtube", "threads", "twitter"]).notNull(),
  // OAuth credentials
  platformUserId: varchar("platformUserId", { length: 255 }).notNull(),
  platformUsername: varchar("platformUsername", { length: 255 }),
  accessToken: text("accessToken").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  // Profile info cached from API
  profilePictureUrl: text("profilePictureUrl"),
  followerCount: int("followerCount").default(0),
  // Cache for feed posts (JSON array)
  cachedPosts: text("cachedPosts"),
  cacheExpiresAt: timestamp("cacheExpiresAt"),
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("smc_user_id_idx").on(table.userId),
  platformIdx: index("smc_platform_idx").on(table.platform),
  uniqueUserPlatform: index("smc_unique_user_platform").on(table.userId, table.platform),
}));
export type SocialMediaConnection = typeof socialMediaConnections.$inferSelect;
export type InsertSocialMediaConnection = typeof socialMediaConnections.$inferInsert;
