CREATE TABLE `school_news_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`issue_date` varchar(10) NOT NULL,
	`cover_url` varchar(1024),
	`description` text,
	`season_label` varchar(128) NOT NULL DEFAULT 'موسم العقيق 2026',
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`created_by` int NOT NULL,
	`published_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `school_news_issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `school_news_issues_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `school_news_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issue_id` int NOT NULL,
	`image_url` varchar(1024) NOT NULL,
	`image_storage_key` varchar(512),
	`caption` varchar(255),
	`page_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `school_news_pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `experience_world` varchar(64) DEFAULT 'golden-stage' NOT NULL;--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `story_line` text;--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `trailer_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `stage_scenes` text;--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `memory_cover_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `ceremonies` ADD `season_order` int DEFAULT 0 NOT NULL;