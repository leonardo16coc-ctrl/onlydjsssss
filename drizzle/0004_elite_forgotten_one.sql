CREATE TABLE `dj_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` enum('club_killer','festival_weapon','peak_time_master','ai_power_dj','verified_dj','precision_master','rising_star','top_10_dj','sound_designer','bass_lord') NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`progress` int NOT NULL DEFAULT 0,
	CONSTRAINT `dj_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dj_badges_user_id_idx` ON `dj_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `dj_badges_type_idx` ON `dj_badges` (`badgeType`);--> statement-breakpoint
CREATE INDEX `dj_badges_user_badge_unique` ON `dj_badges` (`userId`,`badgeType`);