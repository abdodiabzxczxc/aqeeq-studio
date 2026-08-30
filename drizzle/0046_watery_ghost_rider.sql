ALTER TABLE `aqeeq_albums` ADD `category` varchar(96) DEFAULT 'عام' NOT NULL;--> statement-breakpoint
ALTER TABLE `aqeeq_showcase_posts` ADD `category` varchar(96) DEFAULT 'عام' NOT NULL;--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `category` varchar(96) DEFAULT 'عام' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_aqeeq_albums_status_category` ON `aqeeq_albums` (`status`,`category`);--> statement-breakpoint
CREATE INDEX `idx_aqeeq_showcase_posts_category` ON `aqeeq_showcase_posts` (`showcase_id`,`category`);--> statement-breakpoint
CREATE INDEX `idx_school_news_issues_status_category` ON `school_news_issues` (`status`,`category`);