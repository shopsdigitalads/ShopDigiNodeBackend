create database shopdigitalads;

use shopdigitalads;



CREATE TABLE OtpVerification(
    mobile_no_or_email VARCHAR(100) NOT NULL,
    otp VARCHAR(100) NOT NULL,
    expire_time TIMESTAMP NOT NULL,
    verified VARCHAR(10)
);


CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) NOT NULL,
  mobile VARCHAR(12) NOT NULL,
  email VARCHAR(100) NOT NULL,
  remark TEXT DEFAULT NULL,
  role ENUM('Admin','Employee','Client','Hr') DEFAULT NULL,
  status ENUM('Active','Inactive','Rejected','On Review') DEFAULT 'On Review',
  emp_id INT DEFAULT NULL,
  password VARCHAR(255),
  profile VARCHAR(400),
  is_partner Boolean DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);

CREATE TABLE BusinessType(
    business_type_id INT PRIMARY KEY AUTO_INCREMENT,
    business_type_name VARCHAR(100) NOT NULL UNIQUE,
    business_type_description VARCHAR(1000),
    status enum('enabled','disabled') DEFAULT 'enabled',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);


CREATE TABLE ClientBusiness (
  client_business_id INT PRIMARY KEY AUTO_INCREMENT,
  client_business_name VARCHAR(255) NOT NULL,
  business_type_id INT NOT NULL,
  interior_img VARCHAR(400) NOT NULL,
  exterior_img VARCHAR(400) NOT NULL,
  client_business_status ENUM('Approved','Rejected','On Review') DEFAULT 'On Review',
  client_business_remark TEXT DEFAULT NULL,
  update_request ENUM("Accepted","Rejected","Submitted")
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (business_type_id) REFERENCES BusinessType(business_type_id)
);


CREATE TABLE Address (
  address_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  client_business_id INT DEFAULT NULL,
  pin_code VARCHAR(10) DEFAULT NULL,
  area VARCHAR(255) DEFAULT NULL,
  cluster VARCHAR(255) DEFAULT NULL,
  district VARCHAR(255) DEFAULT NULL,
  state VARCHAR(255) DEFAULT NULL,
  google_map_location VARCHAR(255) DEFAULT NULL,
  landmark VARCHAR(500),
  address_line varchar(1000)
  address_type ENUM("Home","Business"),
  update_request ENUM("Accepted","Rejected","Submitted")
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (client_business_id) REFERENCES ClientBusiness(client_business_id)
);

CREATE TABLE KYC (
  kyc_id INT PRIMARY KEY AUTO_INCREMENT,
  adhar_no VARCHAR(15) NOT NULL,
  pan_no VARCHAR(15) NOT NULL,
  adhar_front_img VARCHAR(400) NOT NULL,
  adhar_back_img VARCHAR(400) NOT NULL,
  pan_img VARCHAR(400) NOT NULL,
  acc_holder_name VARCHAR(255) NOT NULL,
  acc_no VARCHAR(50) NOT NULL,
  bank_ifsc VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  bank_branch_name VARCHAR(255) NOT NULL,
  bank_proof_img VARCHAR(400) NOT NULL,
  kyc_status ENUM('Approved','Rejected','On Review') DEFAULT 'On Review',
  update_request ENUM("Accepted","Rejected","Submitted")
  kyc_remark TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);




CREATE TABLE DisplayType(
    display_type_id INT PRIMARY KEY AUTO_INCREMENT,
    display_type VARCHAR(50) NOT NULL,
    display_location_type ENUM('Main Area','Gully'),
    display_city VARCHAR(100),
    display_charge INT NOT NULL,
    client_charge DECIMAL(10,2) NOT NULL
    min INT NOT NULL,
    fine DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
);

CREATE TABLE Display(
    display_id INT PRIMARY KEY AUTO_INCREMENT,
    display_img VARCHAR(400) NOT NULL,
    display_video VARCHAR(400) NOT NULL,
    display_status ENUM('Approved','Rejected','On Review','Active','Inactive') DEFAULT 'On Review',
    display_remark TEXT,
    fcm_token VARCHAR(500),
    youtube_video_link VARCHAR(200),
    display_type_id INT,
    client_business_id INT,
    update_request ENUM("Accepted","Rejected","Submitted")
    FOREIGN KEY (display_type_id) REFERENCES DisplayType(display_type_id),
    FOREIGN KEY (client_business_id) REFERENCES ClientBusiness(client_business_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
)AUTO_INCREMENT = 100000;



CREATE TABLE DisplayEarning(
    display_earning_id INT PRIMARY KEY  AUTO_INCREMENT,
    display_id INT NOT NULL,
    ad_count INT,
    earning_date DATE,
    active_time INT DEFAULT 0,
    inactive_time INT DEFAULT 10,
    earning INT DEFAULT 0,
    fine INT DEFAULT 0,
    total_earning INT DEFAULT 0,
    FOREIGN KEY (display_id) REFERENCES Display(display_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
);


CREATE TABLE Advertisement(
    ads_id  INT PRIMARY KEY AUTO_INCREMENT,
    ad_type ENUM("IMAGE","VIDEO") NOT NULL,
    ad_path VARCHAR(400) NOT NULL,
    ad_campaign_name varchar(255) DEFAULT NULL,
    ad_description TEXT,
    ad_goal ENUM("Brand awareness","Lead generation","Sales conversions","Event promotion","Product/service launch") NOT NULL,
    start_date DATE,
    end_date DATE,
    ad_status ENUM('Approved','Rejected','On Review','Published','Expire') DEFAULT 'On Review',
    ad_remark TEXT,
    business_type_id INT NOT NULL,
    user_id INT NOT NULL,
    emp_id INT,
    is_optimize enum('Not Optimize','Optimizing','Optimized'),
    is_self_ad Boolean DEFAULT 0,
    pay ENUM('with_pay', 'without_pay') DEFAULT 'with_pay';
    references_ads_id INT DEFAULT NULL;
    FOREIGN KEY (emp_id) REFERENCES Users(user_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (business_type_id) REFERENCES BusinessType(business_type_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
)AUTO_INCREMENT = 100000;



CREATE TABLE AdvertisementLocation(
    ad_location_id INT PRIMARY KEY AUTO_INCREMENT,
    address_id INT NOT NULL,
    ads_id INT NOT NULL,
    FOREIGN KEY (ads_id) REFERENCES Advertisement(ads_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id),
    UNIQUE (ads_id, address_id)
);


CREATE TABLE AdvertisementDisplay(
    ad_display_id INT PRIMARY KEY AUTO_INCREMENT,
    display_id INT NOT NULL,
    ads_id INT NOT NULL,
    share_per DECIMAL(10,4) DEFAULT 30.00,
    pay_amount DECIMAL(10,4),
    process_start_date DATE ,
    process_end_date DATE ,
    pay_status ENUM("Paid","Unpaid") DEFAULT "Unpaid",
    FOREIGN KEY (ads_id) REFERENCES Advertisement(ads_id),
    FOREIGN KEY (display_id) REFERENCES Display(display_id),
    UNIQUE (ads_id, display_id) 
);


CREATE TABLE Invoice(
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    ads_id INT NOT NULL UNIQUE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discount DECIMAL(2,2),
    gst DECIMAL(10,4),
    total_charge DECIMAL(10,4),
    ad_amt DECIMAL(10,4),
    ad_bill_status ENUM("Paid","Unpaid","Partial Payment"),
    FOREIGN KEY (ads_id) REFERENCES Advertisement(ads_id)
);

CREATE TABLE InvoiceDetail(
    invoice_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    display_type_id INT NOT NULL,
    display_charge DECIMAL(10,2) NOT NULL,
    no_of_display INT NOT NULL,
    no_of_days INT NOT NULL,
    total_charge DECIMAL(10,4),
    invoice_id INT NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES Invoice(invoice_id)
);

--  Not Used becuase of logical issues
CREATE TABLE AdvertisementBill(
    ad_bill_id INT PRIMARY KEY AUTO_INCREMENT,
    
    
    total_amt DECIMAL(10,4),
    paid_amt DECIMAL(10,4),
   
    ads_id INT NOT NULL,
    invoice_id INT NOT NULL,
    FOREIGN KEY (ads_id) REFERENCES Advertisement(ads_id),
    FOREIGN KEY(invoice_id) REFERENCES Invoice(invoice_id)
);


CREATE TABLE MakeAdvertisement (
    make_ad_id INT PRIMARY KEY AUTO_INCREMENT,
    make_ad_campaign_name VARCHAR(500) NOT NULL,
    make_ad_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    make_ad_path VARCHAR(100) NULL,
    make_ad_description TEXT,
    make_ad_goal ENUM('Brand awareness', 'Lead generation', 'Sales conversions', 'Event promotion', 'Product/service launch') NOT NULL,
    make_ad_status ENUM('Approved', 'Rejected', 'On Review', 'Published', 'Expire') DEFAULT 'On Review',
    business_type_id INT NOT NULL,
    budget INT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
)AUTO_INCREMENT = 100000;


CREATE TABLE Leads (
    lead_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    org_name VARCHAR(255) NOT NULL,
    follow_up_date DATE NOT NULL,
    contact_date DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL ,
    lead_type ENUM("Display","Ads"),
    remark TEXT,
    user_id INT NOT NULL,
    visiting_card_path VARCHAR(400),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


CREATE TABLE uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(500) NOT NULL,
  filetype VARCHAR(50) NOT NULL,
  ads_type ENUM("app,",'website') DEFAULT 'app',
  upload_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
) ;

CREATE TABLE forgot_pass (
   id INT PRIMARY KEY AUTO_INCREMENT,
   user_id INT NOT NULL,
   reset_token VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
   expires_at TIMESTAMP NULL DEFAULT NULL,
   is_used TINYINT(1) DEFAULT 0
);


CREATE TABLE Carsoul(
    carsoul_id INT PRIMARY AUTO_INCREMENT,
    carsoul_path VARCHAR(400),
)
