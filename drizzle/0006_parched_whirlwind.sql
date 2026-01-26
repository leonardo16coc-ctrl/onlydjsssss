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
CREATE INDEX `set_feedback_set_id_idx` ON `set_feedback` (`setId`);--> statement-breakpoint
CREATE INDEX `set_feedback_user_id_idx` ON `set_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `set_feedback_user_set_unique` ON `set_feedback` (`userId`,`setId`);