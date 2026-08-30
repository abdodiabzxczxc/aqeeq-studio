ALTER TABLE `school_news_issues` ADD `watermark_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `watermark_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `watermark_scale` int DEFAULT 42 NOT NULL;--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `watermark_opacity` int DEFAULT 12 NOT NULL;--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `watermark_position` varchar(24) DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `watermark_tint` varchar(32) DEFAULT '#d6b96a' NOT NULL;
