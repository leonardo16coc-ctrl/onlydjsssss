CREATE TABLE `artist_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('stripe','paypal','bank_transfer') NOT NULL,
	`stripeTransferId` varchar(255),
	`paypalTransactionId` varchar(255),
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`totalDownloads` int NOT NULL DEFAULT 0,
	`notes` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`artistId` int NOT NULL,
	`downloadId` int NOT NULL,
	`downloaderId` int NOT NULL,
	`revenuePerDownload` decimal(5,2) NOT NULL DEFAULT '0.50',
	`artistShare` decimal(5,2) NOT NULL DEFAULT '0.30',
	`platformShare` decimal(5,2) NOT NULL DEFAULT '0.20',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `track_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `artist_payouts_artist_id_idx` ON `artist_payouts` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_payouts_status_idx` ON `artist_payouts` (`status`);--> statement-breakpoint
CREATE INDEX `artist_payouts_created_at_idx` ON `artist_payouts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `track_earnings_track_id_idx` ON `track_earnings` (`trackId`);--> statement-breakpoint
CREATE INDEX `track_earnings_artist_id_idx` ON `track_earnings` (`artistId`);--> statement-breakpoint
CREATE INDEX `track_earnings_download_id_idx` ON `track_earnings` (`downloadId`);--> statement-breakpoint
CREATE INDEX `track_earnings_created_at_idx` ON `track_earnings` (`createdAt`);