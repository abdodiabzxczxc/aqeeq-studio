CREATE TABLE `invitation_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ceremony_id` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`source_template_id` varchar(64) NOT NULL,
	`config` text NOT NULL,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invitation_presets_id` PRIMARY KEY(`id`)
);
