CREATE TABLE `platform_content_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_key` varchar(128) NOT NULL,
	`previous_value` text NOT NULL,
	`new_value` text NOT NULL,
	`source` enum('manual','reset','ai','undo') NOT NULL DEFAULT 'manual',
	`user_id` int NOT NULL,
	`reverted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_content_history_id` PRIMARY KEY(`id`)
);
