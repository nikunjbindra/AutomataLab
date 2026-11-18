CREATE TABLE `conversion_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_machine_id` text,
	`result_machine_id` text,
	`source_type` text NOT NULL,
	`target_type` text NOT NULL,
	`source_machine_data` text NOT NULL,
	`result_machine_data` text NOT NULL,
	`steps_data` text NOT NULL,
	`metrics` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`source_machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`result_machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`initial_state` text NOT NULL,
	`alphabet` text NOT NULL,
	`output_alphabet` text NOT NULL,
	`machine_data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `simulation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`machine_id` text,
	`machine_type` text NOT NULL,
	`input_sequence` text NOT NULL,
	`output_sequence` text NOT NULL,
	`trace_data` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` text PRIMARY KEY NOT NULL,
	`machine_id` text NOT NULL,
	`name` text NOT NULL,
	`output` text,
	`is_initial` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `states_machine_name_idx` ON `states` (`machine_id`,`name`);--> statement-breakpoint
CREATE TABLE `test_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`machine_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`input_sequence` text NOT NULL,
	`expected_output` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transitions` (
	`id` text PRIMARY KEY NOT NULL,
	`machine_id` text NOT NULL,
	`from_state` text NOT NULL,
	`input_symbol` text NOT NULL,
	`to_state` text NOT NULL,
	`output_symbol` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transitions_machine_from_input_idx` ON `transitions` (`machine_id`,`from_state`,`input_symbol`);