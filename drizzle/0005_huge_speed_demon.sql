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
CREATE INDEX `weekly_challenges_user_id_idx` ON `weekly_challenges` (`userId`);--> statement-breakpoint
CREATE INDEX `weekly_challenges_week_idx` ON `weekly_challenges` (`weekStart`);--> statement-breakpoint
CREATE INDEX `weekly_challenges_user_week_unique` ON `weekly_challenges` (`userId`,`weekStart`,`challengeType`);