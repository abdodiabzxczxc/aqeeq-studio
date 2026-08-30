CREATE TABLE `visual_element_override_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`override_id` int,
	`page_path` varchar(255) NOT NULL,
	`element_id` varchar(128) NOT NULL,
	`snapshot` text NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visual_element_override_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `status` enum('draft','published') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `published_at` timestamp;