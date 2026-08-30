CREATE TABLE `custom_page_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_id` int,
	`slug` varchar(96) NOT NULL,
	`snapshot` text NOT NULL,
	`action` varchar(32) NOT NULL DEFAULT 'update',
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_page_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_section_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_path` varchar(255) NOT NULL,
	`section_id` varchar(128) NOT NULL,
	`snapshot` text NOT NULL,
	`action` varchar(32) NOT NULL DEFAULT 'save',
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_section_history_id` PRIMARY KEY(`id`)
);
