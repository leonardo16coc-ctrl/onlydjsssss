CREATE TABLE `dna_share_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`format` enum('story','square','banner') NOT NULL,
	`platform` enum('download','twitter','facebook','whatsapp','copy') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dna_share_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dna_share_analytics_user_id_idx` ON `dna_share_analytics` (`userId`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_format_idx` ON `dna_share_analytics` (`format`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_platform_idx` ON `dna_share_analytics` (`platform`);--> statement-breakpoint
CREATE INDEX `dna_share_analytics_created_at_idx` ON `dna_share_analytics` (`createdAt`);