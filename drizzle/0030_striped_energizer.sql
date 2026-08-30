ALTER TABLE `visual_element_overrides` ADD `layer_x` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `layer_y` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `layer_width` int;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `layer_height` int;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `layer_z_index` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visual_element_overrides` ADD `is_hidden` boolean DEFAULT false NOT NULL;