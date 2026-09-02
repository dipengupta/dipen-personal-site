CREATE TABLE `education` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school` text NOT NULL,
	`degree` text NOT NULL,
	`dates` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`dates` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`links_json` text DEFAULT '[]' NOT NULL,
	`image_path` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
