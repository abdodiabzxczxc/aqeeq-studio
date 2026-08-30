CREATE TABLE `director_ai_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`ceremony_id` int,
	`request` text NOT NULL,
	`response` text NOT NULL,
	`action_type` varchar(64),
	`payload` text,
	`status` enum('proposed','applied','cancelled','failed') NOT NULL DEFAULT 'proposed',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`applied_at` timestamp,
	CONSTRAINT `director_ai_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_key` varchar(128) NOT NULL,
	`section` varchar(128) NOT NULL,
	`label` varchar(255) NOT NULL,
	`content_value` text NOT NULL,
	`value_type` enum('text','textarea') NOT NULL DEFAULT 'text',
	`is_public` boolean NOT NULL DEFAULT false,
	`updated_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_content_content_key_unique` UNIQUE(`content_key`)
);
