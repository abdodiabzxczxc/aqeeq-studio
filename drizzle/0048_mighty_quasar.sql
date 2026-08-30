CREATE TABLE `aqeeq_content_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_type` enum('journal','album','showcase_post') NOT NULL,
	`content_id` int NOT NULL,
	`viewer_key` varchar(64) NOT NULL,
	`last_viewed_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aqeeq_content_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_aqeeq_content_viewer` UNIQUE(`content_type`,`content_id`,`viewer_key`)
);
--> statement-breakpoint
CREATE INDEX `idx_aqeeq_content_view_lookup` ON `aqeeq_content_views` (`content_type`,`content_id`);