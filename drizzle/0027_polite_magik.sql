CREATE TABLE `event_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ceremony_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`owner_label` varchar(128),
	`due_label` varchar(128),
	`status` enum('todo','doing','done') NOT NULL DEFAULT 'todo',
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_tasks_id` PRIMARY KEY(`id`)
);
