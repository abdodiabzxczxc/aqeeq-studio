ALTER TABLE `visual_element_overrides` ADD `media_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `alt_text` varchar(300);--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `link_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `alignment` enum('start','center','end','stretch');