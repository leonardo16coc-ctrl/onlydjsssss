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
CREATE INDEX `track_festival_scores_track_id_idx` ON `track_festival_scores` (`trackId`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_festival_score_idx` ON `track_festival_scores` (`festivalScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_peak_time_score_idx` ON `track_festival_scores` (`peakTimeScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_drop_impact_score_idx` ON `track_festival_scores` (`dropImpactScore`);--> statement-breakpoint
CREATE INDEX `track_festival_scores_mainstage_compatibility_score_idx` ON `track_festival_scores` (`mainstageCompatibilityScore`);