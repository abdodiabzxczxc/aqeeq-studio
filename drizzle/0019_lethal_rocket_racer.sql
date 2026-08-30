CREATE TABLE `custom_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`title` varchar(180) NOT NULL,
	`nav_label` varchar(96) NOT NULL,
	`is_visible` boolean NOT NULL DEFAULT true,
	`order_index` int NOT NULL DEFAULT 0,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`created_by` int NOT NULL,
	`updated_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storage_key` varchar(512),
	`url` varchar(1024) NOT NULL,
	`kind` enum('image','video','embed') NOT NULL DEFAULT 'image',
	`mime_type` varchar(128),
	`file_name` varchar(255) NOT NULL,
	`file_size` int,
	`alt_text` varchar(300),
	`uploaded_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_media_assets_url` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_path` varchar(255) NOT NULL,
	`section_id` varchar(128) NOT NULL,
	`section_type` enum('hero','features','gallery','video','cta','custom') NOT NULL,
	`order_index` int NOT NULL DEFAULT 0,
	`config` text NOT NULL,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`published_config` text,
	`updated_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_page_sections_path_id` UNIQUE(`page_path`,`section_id`)
);
