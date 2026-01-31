CREATE TABLE `device_fingerprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fingerprintHash` varchar(64) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`deviceType` varchar(50),
	`browser` varchar(100),
	`os` varchar(100),
	`screenResolution` varchar(20),
	`timezone` varchar(100),
	`language` varchar(10),
	`isVPN` boolean NOT NULL DEFAULT false,
	`isProxy` boolean NOT NULL DEFAULT false,
	`isTor` boolean NOT NULL DEFAULT false,
	`isBot` boolean NOT NULL DEFAULT false,
	`botScore` int NOT NULL DEFAULT 0,
	`isSuspicious` boolean NOT NULL DEFAULT false,
	`isBlocked` boolean NOT NULL DEFAULT false,
	`blockReason` text,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`activityCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `device_fingerprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dj_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`totalDownloads` int NOT NULL DEFAULT 0,
	`totalStreams` int NOT NULL DEFAULT 0,
	`totalMinutesListened` int NOT NULL DEFAULT 0,
	`totalFavorites` int NOT NULL DEFAULT 0,
	`totalPlaylistAdds` int NOT NULL DEFAULT 0,
	`downloadsScore` decimal(8,2) NOT NULL DEFAULT '0.00',
	`streamsScore` decimal(8,2) NOT NULL DEFAULT '0.00',
	`listeningTimeScore` decimal(8,2) NOT NULL DEFAULT '0.00',
	`engagementScore` decimal(8,2) NOT NULL DEFAULT '0.00',
	`djScore` decimal(10,2) NOT NULL DEFAULT '0.00',
	`participationPercentage` decimal(5,2) NOT NULL DEFAULT '0.00',
	`downloadEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`scoreEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`calculatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dj_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `download_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`downloadsCount` int NOT NULL DEFAULT 0,
	`trackDownloads` text,
	`lastResetAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `download_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_revenue_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`totalRevenue` decimal(12,2) NOT NULL DEFAULT '0.00',
	`platformShare` decimal(12,2) NOT NULL DEFAULT '0.00',
	`djsShare` decimal(12,2) NOT NULL DEFAULT '0.00',
	`downloadsPool` decimal(12,2) NOT NULL DEFAULT '0.00',
	`scorePool` decimal(12,2) NOT NULL DEFAULT '0.00',
	`totalDownloads` int NOT NULL DEFAULT 0,
	`totalDJScore` decimal(12,2) NOT NULL DEFAULT '0.00',
	`valuePerDownload` decimal(8,4) NOT NULL DEFAULT '0.0000',
	`status` enum('calculating','completed','paid') NOT NULL DEFAULT 'calculating',
	`calculatedAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_revenue_pools_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_revenue_pools_month_unique` UNIQUE(`month`)
);
--> statement-breakpoint
CREATE TABLE `streaming_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`artistId` int NOT NULL,
	`durationSeconds` int NOT NULL,
	`completionPercentage` int NOT NULL,
	`sessionId` varchar(64),
	`ipAddress` varchar(45),
	`device` varchar(100),
	`isSuspicious` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','unpaid','trialing') NOT NULL,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
CREATE INDEX `device_fingerprints_user_id_idx` ON `device_fingerprints` (`userId`);--> statement-breakpoint
CREATE INDEX `device_fingerprints_hash_idx` ON `device_fingerprints` (`fingerprintHash`);--> statement-breakpoint
CREATE INDEX `device_fingerprints_ip_idx` ON `device_fingerprints` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `device_fingerprints_suspicious_idx` ON `device_fingerprints` (`isSuspicious`);--> statement-breakpoint
CREATE INDEX `dj_scores_user_id_idx` ON `dj_scores` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_scores_month_idx` ON `dj_scores` (`month`);--> statement-breakpoint
CREATE INDEX `dj_scores_dj_score_idx` ON `dj_scores` (`djScore`);--> statement-breakpoint
CREATE INDEX `dj_scores_user_month_unique` ON `dj_scores` (`userId`,`month`);--> statement-breakpoint
CREATE INDEX `download_limits_user_id_idx` ON `download_limits` (`userId`);--> statement-breakpoint
CREATE INDEX `download_limits_date_idx` ON `download_limits` (`date`);--> statement-breakpoint
CREATE INDEX `download_limits_user_date_unique` ON `download_limits` (`userId`,`date`);--> statement-breakpoint
CREATE INDEX `monthly_revenue_pools_month_idx` ON `monthly_revenue_pools` (`month`);--> statement-breakpoint
CREATE INDEX `monthly_revenue_pools_status_idx` ON `monthly_revenue_pools` (`status`);--> statement-breakpoint
CREATE INDEX `streaming_activity_user_id_idx` ON `streaming_activity` (`userId`);--> statement-breakpoint
CREATE INDEX `streaming_activity_track_id_idx` ON `streaming_activity` (`trackId`);--> statement-breakpoint
CREATE INDEX `streaming_activity_artist_id_idx` ON `streaming_activity` (`artistId`);--> statement-breakpoint
CREATE INDEX `streaming_activity_created_at_idx` ON `streaming_activity` (`createdAt`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);