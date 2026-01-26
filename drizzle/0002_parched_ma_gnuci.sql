ALTER TABLE `users` ADD `username` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImageUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profileImageKey` text;--> statement-breakpoint
ALTER TABLE `users` ADD `socialLinks` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);