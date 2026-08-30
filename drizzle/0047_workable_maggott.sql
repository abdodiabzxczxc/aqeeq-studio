DROP INDEX `idx_aqeeq_albums_status_category` ON `aqeeq_albums`;--> statement-breakpoint
DROP INDEX `idx_aqeeq_showcase_posts_category` ON `aqeeq_showcase_posts`;--> statement-breakpoint
DROP INDEX `idx_school_news_issues_status_category` ON `school_news_issues`;--> statement-breakpoint
ALTER TABLE `aqeeq_albums` ADD `view_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `aqeeq_showcase_posts` ADD `view_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `view_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_aqeeq_albums_status_views` ON `aqeeq_albums` (`status`,`view_count`);--> statement-breakpoint
CREATE INDEX `idx_aqeeq_showcase_posts_views` ON `aqeeq_showcase_posts` (`showcase_id`,`view_count`);--> statement-breakpoint
CREATE INDEX `idx_school_news_issues_status_views` ON `school_news_issues` (`status`,`view_count`);--> statement-breakpoint
ALTER TABLE `aqeeq_albums` DROP COLUMN `category`;--> statement-breakpoint
ALTER TABLE `aqeeq_showcase_posts` DROP COLUMN `category`;--> statement-breakpoint
ALTER TABLE `school_news_issues` DROP COLUMN `category`;