CREATE TABLE `aqeeq_album_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`album_id` int NOT NULL,
	`drive_file_id` varchar(128) NOT NULL,
	`media_url` varchar(1024) NOT NULL,
	`thumbnail_url` varchar(1024),
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`media_type` enum('image','video') NOT NULL,
	`caption` varchar(255),
	`media_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aqeeq_album_media_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_aqeeq_album_drive_file` UNIQUE(`album_id`,`drive_file_id`)
);
--> statement-breakpoint
CREATE TABLE `aqeeq_albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`ceremony_id` int,
	`album_date` varchar(10) NOT NULL,
	`description` text,
	`drive_folder_url` varchar(1024) NOT NULL,
	`cover_url` varchar(1024),
	`reading_mode` varchar(24) NOT NULL DEFAULT 'spread',
	`reader_theme` varchar(16) NOT NULL DEFAULT 'dark',
	`header_logo_url` varchar(1024),
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
	CONSTRAINT `aqeeq_albums_id` PRIMARY KEY(`id`),
	CONSTRAINT `aqeeq_albums_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_aqeeq_album_media_order` ON `aqeeq_album_media` (`album_id`,`media_order`);--> statement-breakpoint
CREATE INDEX `idx_aqeeq_albums_status_date` ON `aqeeq_albums` (`status`,`album_date`);