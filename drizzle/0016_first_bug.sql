CREATE TABLE `visual_element_overrides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_path` varchar(255) NOT NULL,
	`element_id` varchar(128) NOT NULL,
	`element_tag` varchar(64) NOT NULL,
	`content_text` text,
	`text_color` varchar(64),
	`bg_color` varchar(64),
	`font_size` varchar(32),
	`padding` varchar(32),
	`margin` varchar(32),
	`border_radius` varchar(32),
	`custom_css` text,
	`updated_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visual_element_overrides_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_page_element` UNIQUE(`page_path`,`element_id`)
);
