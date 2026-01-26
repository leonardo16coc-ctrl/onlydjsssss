CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`artistId` int NOT NULL,
	`ipAddress` varchar(45),
	`country` varchar(100),
	`device` varchar(100),
	`userAgent` text,
	`isSuspicious` boolean DEFAULT false,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`totalDownloads` int NOT NULL DEFAULT 0,
	`platformDownloads` int NOT NULL DEFAULT 0,
	`revenuePool` decimal(10,2) NOT NULL DEFAULT '0.00',
	`djShare` decimal(10,2) NOT NULL DEFAULT '0.00',
	`userEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fraud_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`ipAddress` varchar(45),
	`action` varchar(100) NOT NULL,
	`reason` text,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`isBlocked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fraud_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`likedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`trackId` int NOT NULL,
	`position` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlist_tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`trackCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`audioFileKey` text NOT NULL,
	`audioFileUrl` text NOT NULL,
	`previewFileKey` text,
	`previewFileUrl` text,
	`waveformData` text,
	`coverImageKey` text,
	`coverImageUrl` text,
	`bpm` int,
	`musicalKey` varchar(10),
	`genre` enum('Tech House','Bass House','Afro House','Techno','Melodic Techno','Big Room','EDM','Hard Techno','Latin','Reggaeton','Hip-Hop','Open Format') NOT NULL,
	`subgenre` varchar(100),
	`trackType` enum('Extended Mix','Edit','Mashup','Remix','Rework') NOT NULL,
	`energy` int,
	`mood` varchar(100),
	`tags` text,
	`fileFormat` varchar(20),
	`fileSizeBytes` bigint,
	`durationSeconds` int,
	`hasDrops` boolean DEFAULT false,
	`dropsTimestamps` text,
	`buildsTimestamps` text,
	`isMainstage` boolean NOT NULL DEFAULT false,
	`mainstageCategory` enum('Tech House Mainstage','Bass House Mainstage','Techno Mainstage','Melodic Techno Mainstage','Big Room','EDM Festival','Hard Techno','Latin Mainstage','Reggaeton Mainstage','Hip-Hop Mainstage'),
	`mainstageTags` text,
	`downloadCount` int NOT NULL DEFAULT 0,
	`playCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`availableBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`pendingBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalWithdrawn` decimal(10,2) NOT NULL DEFAULT '0.00',
	`paypalEmail` varchar(320),
	`stripeAccountId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `membershipStatus` enum('free','member','verified') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `djName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `totalDownloads` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalUploads` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `download_user_id_idx` ON `downloads` (`userId`);--> statement-breakpoint
CREATE INDEX `download_track_id_idx` ON `downloads` (`trackId`);--> statement-breakpoint
CREATE INDEX `download_artist_id_idx` ON `downloads` (`artistId`);--> statement-breakpoint
CREATE INDEX `downloaded_at_idx` ON `downloads` (`downloadedAt`);--> statement-breakpoint
CREATE INDEX `earnings_user_id_idx` ON `earnings` (`userId`);--> statement-breakpoint
CREATE INDEX `earnings_month_idx` ON `earnings` (`month`);--> statement-breakpoint
CREATE INDEX `fraud_user_id_idx` ON `fraud_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `fraud_ip_idx` ON `fraud_logs` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `fraud_created_at_idx` ON `fraud_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `likes_user_id_idx` ON `likes` (`userId`);--> statement-breakpoint
CREATE INDEX `likes_track_id_idx` ON `likes` (`trackId`);--> statement-breakpoint
CREATE INDEX `playlist_tracks_playlist_id_idx` ON `playlist_tracks` (`playlistId`);--> statement-breakpoint
CREATE INDEX `playlist_tracks_track_id_idx` ON `playlist_tracks` (`trackId`);--> statement-breakpoint
CREATE INDEX `playlist_user_id_idx` ON `playlists` (`userId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `tracks` (`userId`);--> statement-breakpoint
CREATE INDEX `genre_idx` ON `tracks` (`genre`);--> statement-breakpoint
CREATE INDEX `bpm_idx` ON `tracks` (`bpm`);--> statement-breakpoint
CREATE INDEX `musical_key_idx` ON `tracks` (`musicalKey`);--> statement-breakpoint
CREATE INDEX `is_mainstage_idx` ON `tracks` (`isMainstage`);--> statement-breakpoint
CREATE INDEX `download_count_idx` ON `tracks` (`downloadCount`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `tracks` (`createdAt`);--> statement-breakpoint
CREATE INDEX `wallet_user_id_idx` ON `wallets` (`userId`);--> statement-breakpoint
CREATE INDEX `membership_status_idx` ON `users` (`membershipStatus`);--> statement-breakpoint
CREATE INDEX `total_downloads_idx` ON `users` (`totalDownloads`);