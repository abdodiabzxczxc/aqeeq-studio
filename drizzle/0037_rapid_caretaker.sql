ALTER TABLE `media_assets` MODIFY COLUMN `kind` enum('image','video','audio','embed') NOT NULL DEFAULT 'image';--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `header_logo_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `school_news_issues` ADD `background_audio_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `media_assets` MODIFY `kind` enum('image','video','audio','embed') NOT NULL DEFAULT 'image';
