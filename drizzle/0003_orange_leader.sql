CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`action` varchar(128) NOT NULL,
	`details` text,
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceremonies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` text,
	`venue` varchar(255),
	`ceremonyDate` varchar(64),
	`ceremonyTime` varchar(64),
	`capacity` int NOT NULL DEFAULT 1000,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ceremonies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attendees` ADD `section` varchar(64);--> statement-breakpoint
ALTER TABLE `attendees` ADD `gate` varchar(64);--> statement-breakpoint
ALTER TABLE `attendees` ADD `ceremonyId` int DEFAULT 1 NOT NULL;