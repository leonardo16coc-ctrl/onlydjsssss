CREATE TABLE `auto_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`setType` enum('warmup','peak_time','closing','festival') NOT NULL,
	`avgBpm` int,
	`keyCompatibility` int,
	`energyCurve` text,
	`trackIds` text NOT NULL,
	`trackCount` int NOT NULL DEFAULT 0,
	`transitions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dj_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`activityType` enum('download','play','like','add_to_playlist') NOT NULL,
	`trackBpm` int,
	`trackKey` varchar(10),
	`trackGenre` varchar(100),
	`trackEnergy` int,
	`trackMood` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dj_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dj_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` enum('club_killer','festival_weapon','peak_time_master','ai_power_dj','verified_dj','precision_master','rising_star','top_10_dj','sound_designer','bass_lord') NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`progress` int NOT NULL DEFAULT 0,
	CONSTRAINT `dj_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dj_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalTracksDownloaded` int NOT NULL DEFAULT 0,
	`totalTracksPlayed` int NOT NULL DEFAULT 0,
	`favoriteGenres` text,
	`avgBpm` int,
	`minBpm` int,
	`maxBpm` int,
	`favoriteKeys` text,
	`avgEnergy` int,
	`favoriteMoods` text,
	`lastActivityAt` timestamp,
	`profileScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dj_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `dj_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `dna_share_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`format` enum('story','square','banner') NOT NULL,
	`platform` enum('download','twitter','facebook','whatsapp','copy') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dna_share_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `set_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`workedWell` json,
	`needsImprovement` json,
	`usedInLive` boolean NOT NULL DEFAULT false,
	`venueType` enum('club','festival','bar','radio','stream','other'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `set_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_festival_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`festivalScore` int NOT NULL DEFAULT 0,
	`peakTimeScore` int NOT NULL DEFAULT 0,
	`dropImpactScore` int NOT NULL DEFAULT 0,
	`crowdEnergyScore` int NOT NULL DEFAULT 0,
	`mainstageCompatibilityScore` int NOT NULL DEFAULT 0,
	`crowdImpactScore` int NOT NULL DEFAULT 0,
	`dropExplosionProbability` int NOT NULL DEFAULT 0,
	`handsUpProbability` int NOT NULL DEFAULT 0,
	`energyRetention` int NOT NULL DEFAULT 0,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `track_festival_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStart` timestamp NOT NULL,
	`challengeType` enum('generate_sets','download_tracks','play_tracks','upload_tracks','reach_plays','complete_profile','enter_rankings','gain_followers','use_dj_mode','genre_specialist') NOT NULL,
	`targetValue` int NOT NULL,
	`currentValue` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`badgeAwarded` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `auto_sets_user_id_idx` ON `auto_sets` (`userId`);--> statement-breakpoint
CREATE INDEX `auto_sets_type_idx` ON `auto_sets` (`setType`);--> statement-breakpoint
CREATE INDEX `dj_activity_user_id_idx` ON `dj_activity` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_activity_track_id_idx` ON `dj_activity` (`trackId`);--> statement-breakpoint
CREATE INDEX `dj_activity_type_idx` ON `dj_activity` (`activityType`);--> statement-breakpoint
CREATE INDEX `dj_activity_created_at_idx` ON `dj_activity` (`createdAt`);--> statement-breakpoint
CREATE INDEX `dj_badges_user_id_idx` ON `dj_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_badges_type_idx` ON `dj_badges` (`badgeType`);--> statement-breakpoint
CREATE INDEX `dj_badges_user_badge_unique` ON `dj_badges` (`userId`,`badgeType`);--> statement-breakpoint
CREATE INDEX `dj_profile_user_id_idx` ON `dj_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_profile_score_idx` ON `dj_profiles` (`profileScore`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_user_id_idx` ON `dna_share_analytics` (`userId`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_format_idx` ON `dna_share_analytics` (`format`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_platform_idx` ON `dna_share_analytics` (`platform`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_created_at_idx` ON `dna_share_analytics` (`createdAt`);--> statement-breakpoint
CREATE INDEX `set_feedback_set_id_idx` ON `set_feedback` (`setId`);--> statement-breakpoint
CREATE INDEX `set_feedback_user_id_idx` ON `set_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `set_feedback_user_set_unique` ON `set_feedback` (`userId`,`setId`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_track_id_idx` ON `track_festival_scores` (`trackId`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_festival_score_idx` ON `track_festival_scores` (`festivalScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_peak_time_score_idx` ON `track_festival_scores` (`peakTimeScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_drop_impact_score_idx` ON `track_festival_scores` (`dropImpactScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_mainstage_compatibility_score_idx` ON `track_festival_scores` (`mainstageCompatibilityScore`);--> statement-breakpoint
CREATE INDEX `weekly_challenges_user_id_idx` ON `weekly_challenges` (`userId`);--> statement-breakpoint
CREATE INDEX `weekly_challenges_week_idx` ON `weekly_challenges` (`weekStart`);--> statement-breakpoint
CREATE INDEX `weekly_challenges_user_week_unique` ON `weekly_challenges` (`userId`,`weekStart`,`challengeType`);