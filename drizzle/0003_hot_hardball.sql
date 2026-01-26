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
CREATE INDEX `auto_sets_user_id_idx` ON `auto_sets` (`userId`);--> statement-breakpoint
CREATE INDEX `auto_sets_type_idx` ON `auto_sets` (`setType`);--> statement-breakpoint
CREATE INDEX `dj_activity_user_id_idx` ON `dj_activity` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_activity_track_id_idx` ON `dj_activity` (`trackId`);--> statement-breakpoint
CREATE INDEX `dj_activity_type_idx` ON `dj_activity` (`activityType`);--> statement-breakpoint
CREATE INDEX `dj_activity_created_at_idx` ON `dj_activity` (`createdAt`);--> statement-breakpoint
CREATE INDEX `dj_profile_user_id_idx` ON `dj_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_profile_score_idx` ON `dj_profiles` (`profileScore`);