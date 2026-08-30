CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ceremonyId` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`audience` enum('all','unpaid','absent','attended') NOT NULL DEFAULT 'all',
	`channel` enum('in_app','email','whatsapp') NOT NULL DEFAULT 'in_app',
	`status` enum('draft','queued','sent') NOT NULL DEFAULT 'draft',
	`recipientCount` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
