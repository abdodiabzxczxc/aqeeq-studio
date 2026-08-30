CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(128) NOT NULL,
	`setting_value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_setting_key_unique` UNIQUE(`setting_key`)
);
