CREATE TABLE `conversion_history` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`target_type` text NOT NULL,
	`source_machine_data` text NOT NULL,
	`result_machine_data` text NOT NULL,
	`steps_data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`machine_data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
