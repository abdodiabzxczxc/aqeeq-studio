CREATE TABLE `attendees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`idNumber` varchar(50) NOT NULL,
	`ticketType` enum('student','guardian','guest','vip') NOT NULL DEFAULT 'guest',
	`paymentStatus` enum('paid','unpaid','exempt') NOT NULL DEFAULT 'unpaid',
	`qrCode` varchar(100) NOT NULL,
	`attended` boolean NOT NULL DEFAULT false,
	`checkedInAt` bigint,
	`notes` text,
	`seatNumber` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `attendees_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendees_idNumber_unique` UNIQUE(`idNumber`),
	CONSTRAINT `attendees_qrCode_unique` UNIQUE(`qrCode`)
);
--> statement-breakpoint
CREATE TABLE `scan_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attendeeId` int NOT NULL,
	`qrCode` varchar(100) NOT NULL,
	`result` enum('success','duplicate','not_found','invalid') NOT NULL,
	`scannedAt` bigint NOT NULL,
	`scannedBy` int,
	`deviceInfo` text,
	CONSTRAINT `scan_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','receptionist') NOT NULL DEFAULT 'user';