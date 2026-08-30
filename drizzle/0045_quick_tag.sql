CREATE TABLE `aqeeq_showcase_post_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`media_url` varchar(1024) NOT NULL,
	`thumbnail_url` varchar(1024),
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`media_type` enum('image','video') NOT NULL,
	`media_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aqeeq_showcase_post_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aqeeq_album_media` ADD `source_type` varchar(24) DEFAULT 'drive' NOT NULL;--> statement-breakpoint
ALTER TABLE `aqeeq_album_media` ADD `external_url` varchar(1024);--> statement-breakpoint
CREATE INDEX `idx_aqeeq_showcase_post_media_order` ON `aqeeq_showcase_post_media` (`post_id`,`media_order`);