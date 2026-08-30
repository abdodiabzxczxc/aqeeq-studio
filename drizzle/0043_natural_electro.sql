CREATE TABLE `aqeeq_showcase_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`showcase_id` int NOT NULL,
	`drive_file_id` varchar(128) NOT NULL,
	`media_url` varchar(1024) NOT NULL,
	`thumbnail_url` varchar(1024),
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`media_type` enum('image','video') NOT NULL,
	`title` varchar(255),
	`description` text,
	`is_new` boolean NOT NULL DEFAULT true,
	`post_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aqeeq_showcase_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_aqeeq_showcase_drive_file` UNIQUE(`showcase_id`,`drive_file_id`)
);
--> statement-breakpoint
CREATE TABLE `aqeeq_showcases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`intro` text,
	`drive_folder_url` varchar(1024),
	`reader_theme` varchar(16) NOT NULL DEFAULT 'dark',
	`header_logo_url` varchar(1024),
	`background_audio_url` varchar(1024),
	`watermark_url` varchar(1024),
	`watermark_scale` int NOT NULL DEFAULT 42,
	`watermark_opacity` int NOT NULL DEFAULT 12,
	`watermark_position` varchar(24) NOT NULL DEFAULT 'center',
	`watermark_tint` varchar(32) NOT NULL DEFAULT '#d6b96a',
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`created_by` int NOT NULL,
	`published_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aqeeq_showcases_id` PRIMARY KEY(`id`),
	CONSTRAINT `aqeeq_showcases_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_aqeeq_showcase_posts_order` ON `aqeeq_showcase_posts` (`showcase_id`,`post_order`);--> statement-breakpoint
CREATE INDEX `idx_aqeeq_showcases_status` ON `aqeeq_showcases` (`status`);