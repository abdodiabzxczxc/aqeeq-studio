CREATE TABLE `visual_element_trash` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_path` varchar(255) NOT NULL,
	`element_id` varchar(128) NOT NULL,
	`element_tag` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`snapshot` text,
	`deleted_by` int NOT NULL,
	`deleted_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `visual_element_trash_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_visual_element_trash_page_expiry` ON `visual_element_trash` (`page_path`,`expires_at`);