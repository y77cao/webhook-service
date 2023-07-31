-- This file contains SQL queries for defining the tables' schemas.
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone="+00:00";

CREATE TABLE if not exists `developers` (
	`id` SERIAL NOT NULL PRIMARY KEY,
	`email` VARCHAR(255) NOT NULL,
	`name` VARCHAR(255),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `developers_pkey` (`id`),
    UNIQUE KEY `developers_email_unique` (`email`)
) ENGINE=InnoDB;

CREATE TABLE if not exists `applications` (
	`id` SERIAL NOT NULL PRIMARY KEY,
	`developer_id` bigint(20) unsigned NOT NULL,
	`name` VARCHAR(255),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `applications_pkey` (`id`),
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE if not exists `subscriptions` (
	`id` SERIAL NOT NULL PRIMARY KEY,
	`application_id` bigint(20) unsigned NOT NULL,
    `event_type` VARCHAR(255),
    `uri` VARCHAR(255),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `active` BOOLEAN not null default 1,
    `metadata` JSON,
	UNIQUE KEY `subscriptions_pkey` (`id`),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE if not exists `events` (
	`id` SERIAL NOT NULL PRIMARY KEY,
	`event_type` VARCHAR(255) ,
	`subscription_id` bigint(20) unsigned NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `payload` JSON,
	UNIQUE KEY `events_pkey` (`id`),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE if not exists `subscription_status` (
	`subscription_id` bigint(20) unsigned NOT NULL,
    `status_code` int(11),
	`message` VARCHAR(255),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE if not exists `failed_event_deliveries` (
	`id` SERIAL NOT NULL PRIMARY KEY,
	`event_id` bigint(20) unsigned NOT NULL,
	`retries` int(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE `subscriptions` ADD UNIQUE `unique_app_event_uri`(`application_id`, `event_type`, `uri`);
ALTER TABLE `subscription_status` ADD UNIQUE (`subscription_id`)