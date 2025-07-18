-- Create the database if it doesn't exist and use it
CREATE DATABASE IF NOT EXISTS new_shopdigitalads;
USE new_shopdigitalads;

-- 1. Users Table
-- This table is foundational as many other tables link to user IDs.
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `mobile` varchar(12) NOT NULL,
  `email` varchar(100) NOT NULL,
  `remark` text,
  `role` enum('Admin','Employee','Client','Hr') DEFAULT NULL,
  `status` enum('Active','Inactive','Rejected','On Review') DEFAULT 'On Review',
  `emp_id` int DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile` varchar(400) DEFAULT NULL,
  `is_partner` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_mobile` (`mobile`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. OtpVerification Table
-- Related to user authentication.
CREATE TABLE `OtpVerification` (
  `mobile_no_or_email` varchar(100) NOT NULL,
  `otp` varchar(100) NOT NULL,
  `expire_time` timestamp NOT NULL,
  `verified` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. BusinessType Table
-- Defines categories for client businesses and advertisements.
CREATE TABLE `BusinessType` (
  `business_type_id` int NOT NULL AUTO_INCREMENT,
  `business_type_name` varchar(100) NOT NULL,
  `business_type_description` varchar(1000) DEFAULT NULL,
  `status` enum('enabled','disabled') DEFAULT 'enabled',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_type_id`),
  UNIQUE KEY `business_type_name` (`business_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. ClientBusiness Table
-- Links clients (Users) to their businesses and a BusinessType.
CREATE TABLE `ClientBusiness` (
  `client_business_id` int NOT NULL AUTO_INCREMENT,
  `client_business_name` varchar(255) NOT NULL,
  `business_type_id` int NOT NULL,
  `interior_img` varchar(400) NOT NULL,
  `exterior_img` varchar(400) NOT NULL,
  `client_business_status` enum('Approved','Rejected','On Review') DEFAULT 'On Review',
  `client_business_remark` text,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_request` enum('Accepted','Rejected','Submitted') DEFAULT NULL,
  PRIMARY KEY (`client_business_id`),
  KEY `user_id` (`user_id`),
  KEY `business_type_id` (`business_type_id`),
  CONSTRAINT `ClientBusiness_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `ClientBusiness_ibfk_2` FOREIGN KEY (`business_type_id`) REFERENCES `BusinessType` (`business_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Address Table
-- Stores address information, linked to users or client businesses.
CREATE TABLE `Address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `client_business_id` int DEFAULT NULL,
  `pin_code` varchar(10) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `cluster` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `google_map_location` varchar(255) DEFAULT NULL,
  `address_type` enum('Home','Business') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_request` enum('Accepted','Rejected','Submitted') DEFAULT NULL,
  `address_remark` text,
  `landmark` varchar(500) DEFAULT NULL,
  `address_line` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`address_id`),
  KEY `user_id` (`user_id`),
  KEY `client_business_id` (`client_business_id`),
  CONSTRAINT `Address_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `Address_ibfk_2` FOREIGN KEY (`client_business_id`) REFERENCES `ClientBusiness` (`client_business_id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. KYC Table
-- Stores Know Your Customer details for users.
CREATE TABLE `KYC` (
  `kyc_id` int NOT NULL AUTO_INCREMENT,
  `adhar_no` varchar(15) NOT NULL,
  `pan_no` varchar(15) NOT NULL,
  `adhar_front_img` varchar(400) NOT NULL,
  `adhar_back_img` varchar(400) NOT NULL,
  `pan_img` varchar(400) NOT NULL,
  `acc_holder_name` varchar(255) NOT NULL,
  `acc_no` varchar(50) NOT NULL,
  `bank_ifsc` varchar(50) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `bank_branch_name` varchar(255) NOT NULL,
  `bank_proof_img` varchar(400) NOT NULL,
  `kyc_status` enum('Approved','Rejected','On Review') DEFAULT 'On Review',
  `kyc_remark` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `update_request` enum('Accepted','Rejected','Submitted') DEFAULT NULL,
  PRIMARY KEY (`kyc_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `KYC_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. DisplayType Table
-- Defines various types of displays and their associated charges.
CREATE TABLE `DisplayType` (
  `display_type_id` int NOT NULL AUTO_INCREMENT,
  `display_type` varchar(50) NOT NULL,
  `display_location_type` enum('Main Area','Gully') DEFAULT NULL,
  `display_city` varchar(100) DEFAULT NULL,
  `display_charge` decimal(10,2) DEFAULT NULL,
  `client_charge` decimal(10,2) NOT NULL,
  `min` int NOT NULL,
  `fine` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`display_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Display Table
-- Represents individual digital displays, linked to DisplayType and ClientBusiness.
CREATE TABLE `Display` (
  `display_id` int NOT NULL AUTO_INCREMENT,
  `display_img` varchar(400) NOT NULL,
  `display_video` varchar(400) NOT NULL,
  `display_status` enum('Approved','Rejected','On Review','Active','Inactive') DEFAULT 'On Review',
  `display_remark` text,
  `pay_by` enum('Fixed','ByAds','None') DEFAULT 'ByAds',
  `d_type` enum('Private','Public') DEFAULT 'Public',
  `display_type_id` int DEFAULT NULL,
  `client_business_id` int DEFAULT NULL,
  `update_request` enum('Accepted','Rejected','Submitted') DEFAULT NULL,
  `fcm_token` varchar(500) DEFAULT NULL,
  `youtube_video_link` varchar(200) DEFAULT NULL,
  `fixed_pay` decimal(10,2) DEFAULT NULL,
  `share_per` decimal(10,2) DEFAULT '30.00',
  PRIMARY KEY (`display_id`),
  KEY `display_type_id` (`display_type_id`),
  KEY `client_business_id` (`client_business_id`),
  CONSTRAINT `Display_ibfk_1` FOREIGN KEY (`display_type_id`) REFERENCES `DisplayType` (`display_type_id`),
  CONSTRAINT `Display_ibfk_2` FOREIGN KEY (`client_business_id`) REFERENCES `ClientBusiness` (`client_business_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100031 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. DisplayEarning Table
-- Records earnings for each display based on ad count and active time.
CREATE TABLE `DisplayEarning` (
  `display_earning_id` int NOT NULL AUTO_INCREMENT,
  `active_time` int DEFAULT '0',
  `inactive_time` int DEFAULT '10',
  `earning` decimal(10,2) DEFAULT NULL,
  `fine` decimal(10,2) DEFAULT NULL,
  `total_earning` decimal(10,2) DEFAULT NULL,
  `earning_date` date DEFAULT NULL,
  `display_id` int NOT NULL,
  `ad_count` int DEFAULT NULL,
  PRIMARY KEY (`display_earning_id`),
  KEY `display_id` (`display_id`),
  CONSTRAINT `DisplayEarning_ibfk_1` FOREIGN KEY (`display_id`) REFERENCES `Display` (`display_id`)
) ENGINE=InnoDB AUTO_INCREMENT=669 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. DisplayChargeInvoice Table
-- Records invoices for display charges.
CREATE TABLE `DisplayChargeInvoice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `display_id` int DEFAULT NULL,
  `display_type` varchar(400) DEFAULT NULL,
  `charge` decimal(10,2) DEFAULT NULL,
  `bill_status` enum('Paid','Unpaid') DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `display_id` (`display_id`),
  CONSTRAINT `DisplayChargeInvoice_ibfk_1` FOREIGN KEY (`display_id`) REFERENCES `Display` (`display_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. Advertisement Table
-- Defines the details of each advertisement, linked to BusinessType and Users.
CREATE TABLE `Advertisement` (
  `ads_id` int NOT NULL AUTO_INCREMENT,
  `ad_type` enum('IMAGE','VIDEO') NOT NULL,
  `ad_path` varchar(400) NOT NULL,
  `ad_campaign_name` varchar(255) DEFAULT NULL,
  `ad_description` text,
  `ad_goal` enum('Brand awareness','Lead generation','Sales conversions','Event promotion','Product/service launch') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `ad_status` enum('Approved','Rejected','On Review','Published','Expire') DEFAULT 'On Review',
  `ad_remark` text,
  `business_type_id` int NOT NULL,
  `user_id` int NOT NULL,
  `emp_id` int DEFAULT NULL,
  `is_optimize` enum('Not Optimize','Optimizing','Optimized') DEFAULT NULL,
  `is_self_ad` tinyint(1) DEFAULT '0',
  `pay` enum('with_pay','without_pay') DEFAULT 'with_pay',
  `references_ads_id` int DEFAULT NULL,
  PRIMARY KEY (`ads_id`),
  KEY `emp_id` (`emp_id`),
  KEY `user_id` (`user_id`),
  KEY `business_type_id` (`business_type_id`),
  CONSTRAINT `Advertisement_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `Advertisement_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  CONSTRAINT `Advertisement_ibfk_3` FOREIGN KEY (`business_type_id`) REFERENCES `BusinessType` (`business_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. AdvertisementLocation Table
-- Maps advertisements to specific addresses.
CREATE TABLE `AdvertisementLocation` (
  `ad_location_id` int NOT NULL AUTO_INCREMENT,
  `address_id` int NOT NULL,
  `ads_id` int NOT NULL,
  PRIMARY KEY (`ad_location_id`),
  UNIQUE KEY `ads_id` (`ads_id`,`address_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `AdvertisementLocation_ibfk_1` FOREIGN KEY (`ads_id`) REFERENCES `Advertisement` (`ads_id`),
  CONSTRAINT `AdvertisementLocation_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `Address` (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=834 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 13. AdvertisementDisplay Table
-- Links advertisements to specific displays.
CREATE TABLE `AdvertisementDisplay` (
  `ad_display_id` int NOT NULL AUTO_INCREMENT,
  `display_id` int NOT NULL,
  `ads_id` int NOT NULL,
  `pay_status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `share_per` decimal(5,2) DEFAULT '30.00',
  `pay_amount` decimal(10,4) DEFAULT '0.0000',
  `process_start_date` date DEFAULT NULL,
  `process_end_date` date DEFAULT NULL,
  `pay_date` date DEFAULT NULL,
  PRIMARY KEY (`ad_display_id`),
  UNIQUE KEY `ads_id` (`ads_id`,`display_id`),
  KEY `display_id` (`display_id`),
  CONSTRAINT `AdvertisementDisplay_ibfk_1` FOREIGN KEY (`ads_id`) REFERENCES `Advertisement` (`ads_id`),
  CONSTRAINT `AdvertisementDisplay_ibfk_2` FOREIGN KEY (`display_id`) REFERENCES `Display` (`display_id`)
) ENGINE=InnoDB AUTO_INCREMENT=859 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 14. Invoice Table
-- Stores overall invoice details for advertisements.
CREATE TABLE `Invoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `ads_id` int DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ad_amt` decimal(10,4) DEFAULT NULL,
  `discount` decimal(10,4) DEFAULT NULL,
  `gst` decimal(10,4) DEFAULT NULL,
  `total_charge` decimal(10,4) DEFAULT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `ads_id` (`ads_id`),
  CONSTRAINT `fk_invoice_ads_id` FOREIGN KEY (`ads_id`) REFERENCES `Advertisement` (`ads_id`) ON DELETE SET NULL,
  CONSTRAINT `Invoice_ibfk_1` FOREIGN KEY (`ads_id`) REFERENCES `Advertisement` (`ads_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 15. InvoiceDetail Table
-- Provides line-item details for each invoice.
CREATE TABLE `InvoiceDetail` (
  `invoice_detail_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int DEFAULT NULL,
  `display_type_id` int NOT NULL,
  `display_charge` decimal(10,2) NOT NULL,
  `no_of_display` int NOT NULL,
  `no_of_days` int NOT NULL,
  `total_charge` decimal(10,4) DEFAULT NULL,
  PRIMARY KEY (`invoice_detail_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `InvoiceDetail_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `Invoice` (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=292 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 16. AdvertisementBill Table
-- Tracks billing information for advertisements.
CREATE TABLE `AdvertisementBill` (
  `ad_bill_id` int NOT NULL AUTO_INCREMENT,
  `ad_amt` decimal(10,4) DEFAULT NULL,
  `discount` decimal(2,2) DEFAULT NULL,
  `gst_amt` decimal(10,4) DEFAULT NULL,
  `total_amt` decimal(10,4) DEFAULT NULL,
  `paid_amt` decimal(10,4) DEFAULT NULL,
  `ad_bill_status` enum('Paid','Unpaid','Partial Payment') DEFAULT NULL,
  `ads_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  PRIMARY KEY (`ad_bill_id`),
  KEY `ads_id` (`ads_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `AdvertisementBill_ibfk_1` FOREIGN KEY (`ads_id`) REFERENCES `Advertisement` (`ads_id`),
  CONSTRAINT `AdvertisementBill_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `Invoice` (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Trigger for AdvertisementBill
DELIMITER ;;
CREATE TRIGGER `update_pay_amount_after_ad_bill_insert` AFTER INSERT ON `AdvertisementBill` FOR EACH ROW BEGIN
    UPDATE AdvertisementDisplay
    SET pay_amount = (30 / 100) * NEW.total_amt
    WHERE ads_id = NEW.ads_id;
END ;;
DELIMITER ;

-- 17. MakeAdvertisement Table
-- For requests to create advertisements.
CREATE TABLE `MakeAdvertisement` (
  `make_ad_id` int NOT NULL AUTO_INCREMENT,
  `make_ad_campaign_name` varchar(500) NOT NULL,
  `make_ad_type` enum('IMAGE','VIDEO') NOT NULL,
  `make_ad_path` varchar(100) DEFAULT NULL,
  `make_ad_description` text,
  `make_ad_goal` enum('Brand awareness','Lead generation','Sales conversions','Event promotion','Product/service launch') NOT NULL,
  `make_ad_status` enum('Approved','Rejected','On Review','Published','Expire') DEFAULT 'On Review',
  `business_type_id` int NOT NULL,
  `budget` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`make_ad_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `MakeAdvertisement_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 18. Leads Table
-- Stores information about potential clients or sales leads.
CREATE TABLE `Leads` (
  `lead_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `org_name` varchar(255) NOT NULL,
  `follow_up_date` date NOT NULL,
  `contact_date` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `lead_type` enum('Display','Ads') DEFAULT NULL,
  `remark` text,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visiting_card_path` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`lead_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Leads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 19. Uploads Table
-- Manages uploaded files like images or videos.
CREATE TABLE `uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(500) NOT NULL,
  `filetype` varchar(50) NOT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ads_type` enum('app','web') NOT NULL DEFAULT 'app',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 20. forgot_pass Table
-- Stores information for password reset requests.
CREATE TABLE `forgot_pass` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reset_token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 21. ManualInvoice Table
-- This table appears to be for manually created invoices, not directly linked via foreign key to the main Invoice or Advertisement tables.
CREATE TABLE `ManualInvoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `ads_id` int DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `no_of_display` int DEFAULT NULL,
  `no_of_days` int DEFAULT NULL,
  `campaign_name` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `display_type` varchar(255) DEFAULT NULL,
  `display_charge` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `gst` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 22. display_locations Table
-- This table seems to be an alternative or perhaps an older table for display locations, as 'Display' and 'Address' tables already cover this.
CREATE TABLE `display_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` text COLLATE utf8mb4_general_ci NOT NULL,
  `location` text COLLATE utf8mb4_general_ci,
  `pincode` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `video` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;