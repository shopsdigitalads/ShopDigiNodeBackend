import pool from '../../../Database/Database.mjs';
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Ads {
    static createAdd = async (req, res) => {
        try {
            const { make_ad_type, make_ad_description, make_ad_goal, business_type_id, budget, user_id, camp_name } = req.body;

            if (!make_ad_type || !make_ad_goal || !business_type_id || !budget || !user_id) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            const [ad] = await pool.query(`
            INSERT INTO MakeAdvertisement (make_ad_type,make_ad_description,make_ad_goal,business_type_id,budget,user_id,make_ad_campaign_name) VALUES(?,?,?,?,?,?,?)
            `, [make_ad_type, make_ad_description, make_ad_goal, business_type_id, budget, user_id, camp_name])

            if (ad.affectedRows === 1) {
                return res.status(201).json({
                    status: true,
                    message: "Applied Succesfully"
                })
            } else {
                throw new Error('Failed to insert data into database');
            }


        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: "An error occured"
            })
        }
    }

     static getFileSizeInMB = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    reject('Error getting file stats: ' + err);
                    return;
                }
                const fileSizeInMB = stats.size / (1024 * 1024);  // Convert to MB
                resolve(fileSizeInMB);
            });
        });
    }

    static upload = async (req, res) => {
        try {
            const { camp_name, ad_type, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, name, emp_id } = req.body
            if (!ad_type || !ad_goal || !start_date || !end_date || !business_type_id || !user_id || !name || !req.file) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            const ad = req.file

            const folder_path = `${user_id}_${name}/Advertisement`;
            const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_path}`);

            // Create directory if it doesn't exist
            if (!fs.existsSync(base_dir)) {
                fs.mkdirSync(base_dir, { recursive: true });
            }

            let is_optimize;
            const old_path = ad.path;
            const fileSizeInMB = await Ads.getFileSizeInMB(old_path);
            if (fileSizeInMB > 50) {
                is_optimize = "Not Optimize";
            } else {
                is_optimize = "Optimized";
            }
            console.log(is_optimize)

            const file_extension = path.extname(ad.originalname) || ".jpg";
            const new_file_name = `${ad.fieldname}_${Date.now()}${file_extension}`;
            const new_path = path.join(base_dir, new_file_name);

            fs.renameSync(old_path, new_path);
            const ad_path = path.relative(path.resolve(__dirname, "../../../../"), new_path);


            const [advertisement] = await pool.query(
                `INSERT INTO Advertisement (ad_type,ad_path,ad_description,ad_goal,start_date,end_date,business_type_id,user_id,emp_id,ad_campaign_name,is_optimize) VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [ad_type, ad_path, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, emp_id, camp_name,is_optimize]
            )

            if (advertisement.affectedRows === 1) {
                return res.status(201).json({
                    status: true,
                    ads_id: advertisement.insertId,
                    message: "Advertisement Uploaded Succesfully. You can select area where you want to show it."
                })
            } else {
                throw new Error('Failed to insert data into database');
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: "An Error occured"
            })
        }
    }

    static addAdsLocation = async (req, res) => {
        try {
            const { address_id, ad_id } = req.body;
            console.log(address_id, ad_id)
            if (!address_id || !ad_id || !Array.isArray(address_id)) {

                return res.status(400).json({
                    status: false,
                    message: "Data Missing",
                });
            }

            // Prepare the values for bulk insert
            const values = address_id.map((id) => [id, ad_id]);

            // Bulk insert query
            const [result] = await pool.query(
                `INSERT IGNORE INTO AdvertisementLocation (address_id, ads_id) VALUES ?`,
                [values]
            );

            // Generate the ad_location_ids response
            const ad_location_ids = values.map((value, index) => ({
                address_id: value[0],
                ad_location_id: result.insertId + index, // Calculate each inserted ID based on the starting ID
            }));
            console.log("hre")
            return res.status(201).json({
                status: true,
                message: "Locations Added Successfully",
                ad_location_ids: ad_location_ids,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred",
            });
        }
    };

    static updateAd = async (req, res) => {
        try {
            const { camp_name, ad_type, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, name, emp_id, ad_id, add_action } = req.body;
            const ad = req.file

            console.log(add_action)
            const folder_path = `${user_id}_${name}/Advertisement`;
            const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_path}`);

            // Create directory if it doesn't exist
            if (!fs.existsSync(base_dir)) {
                fs.mkdirSync(base_dir, { recursive: true });
            }

            const old_path = ad.path;

            let is_optimize;
            const fileSizeInMB = await Ads.getFileSizeInMB(old_path);
            if (fileSizeInMB > 50) {
                is_optimize = "Not Optimize";
            } else {
                is_optimize = "Optimized";
            }

            const file_extension = path.extname(ad.originalname) || ".jpg";
            const new_file_name = `${ad.fieldname}_${Date.now()}${file_extension}`;
            const new_path = path.join(base_dir, new_file_name);

            fs.renameSync(old_path, new_path);
            const ad_path = path.relative(path.resolve(__dirname, "../../../../"), new_path);

            if (add_action == "Update") {
                const updated_ad = await pool.query(
                    `UPDATE Advertisement SET ad_type = ?, ad_path = ?, ad_status = "On Review",is_optimize = ? where ads_id = ?  
                    `, [ad_type, ad_path,is_optimize, ad_id]
                )
            } else {
                const old_ad_id = ad_id
                const today = new Date();
                const formattedStartDate = today.toISOString().slice(0, 19).replace("T", " ");
                const formattedEndDate = new Date(end_date).toISOString().slice(0, 19).replace("T", " ");

                const [advertisement] = await pool.query(
                    `INSERT INTO Advertisement (ad_type, ad_path, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, emp_id, ad_campaign_name,is_optimize) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
                    [ad_type, ad_path, ad_description, ad_goal, formattedStartDate, formattedEndDate, business_type_id, user_id, emp_id, camp_name,is_optimize]
                );

                const new_ad_id = advertisement.insertId
                const [location] = await pool.query(`
                    INSERT IGNORE INTO AdvertisementLocation (address_id, ads_id)
                    SELECT address_id, ? FROM AdvertisementLocation WHERE ads_id = ?;
                    `, [new_ad_id, old_ad_id])
                const [display] = await pool.query(`
                    INSERT IGNORE INTO AdvertisementDisplay(display_id, ads_id)
                    SELECT display_id, ? FROM AdvertisementDisplay WHERE ads_id = ?;
                    `, [new_ad_id, old_ad_id])
                console.log(old_ad_id)
                const [AdvertisementBill] = await pool.query(`
                        INSERT INTO AdvertisementBill (ad_amt, total_amt, paid_amt, ad_bill_status, ads_id, invoice_id) 
                        SELECT ad_amt, total_amt, paid_amt, ad_bill_status, ?, invoice_id 
                        FROM AdvertisementBill WHERE ads_id = ?;
                    `, [new_ad_id, old_ad_id]);


            }

            return res.status(200).json({
                status: true,
                message: "Advertisement Updated Successfully"
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: "Something went Wrong"
            })
        }
    }


    static addAdDisplay = async (req, res) => {
        try {
            const { displays, ad_id } = req.body;
            console.log(displays, ad_id);
            if (!displays || !ad_id || !Array.isArray(displays)) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing",
                });
            }


            const values = displays.map((display_id) => [
                display_id,
                ad_id,
            ]);

            // Bulk insert query
            const [result] = await pool.query(
                `INSERT IGNORE INTO AdvertisementDisplay (display_id, ads_id) VALUES ?`,
                [values]
            );

            const calculation = await this.getDisplayCostCalculation(ad_id)

            console.log(calculation)
            const bill = await this.createInvoice(ad_id, calculation.total_cost, calculation.display_charge);
            console.log(bill)
            return res.status(201).json({
                status: true,
                message: "Displays added successfully",
                insertedCount: result.affectedRows,
                calculation: calculation,
                bill: bill
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred",
            });
        }
    };

    static getDisplayCostCalculation = async (ad_id) => {
        try {
            const [no_of_days] = await pool.query(`
                select SUM(DATEDIFF(A.end_date, A.start_date) + 1) AS total_days 
                from Advertisement as A where ads_id = ?
                `, [ad_id])

            const [display_charge] = await pool.query(`
                SELECT 
                DT.display_type_id,
                DT.display_charge,
                DT.display_type,
                COUNT(AD.ad_display_id) AS display_count
                FROM 
                    AdvertisementDisplay AD
                JOIN 
                    Display D ON AD.display_id = D.display_id
                JOIN 
                    DisplayType DT ON D.display_type_id = DT.display_type_id
                WHERE 
                    AD.ads_id = ?
                GROUP BY 
                DT.display_type_id, DT.display_type, DT.display_charge;
                `, [ad_id])


            let final_cost = 0
            const days = no_of_days[0].total_days;
            for (const display of display_charge) {
                display['no_of_days'] = days
                display['cost'] = days * display['display_charge'] * display['display_count']
                final_cost = final_cost + display['cost']
            }

            return {
                status: true,
                total_cost: final_cost,
                display_charge: display_charge
            }
        } catch (error) {
            console.log(error)
            return {
                status: false
            }
        }
    }

    static createInvoice = async (ad_id, total_cost, display_charge) => {
        try {
            // Insert into Invoice table
            const [invoice] = await pool.query(
                `INSERT IGNORE INTO Invoice (total_charge, ads_id) VALUES (?, ?)`,
                [total_cost, ad_id]
            );

            // If no new invoice is created, return early
            if (invoice.affectedRows === 0) {
                return {
                    status: false,
                    message: "Invoice already exists for this ad."
                };
            }

            const invoice_id = invoice.insertId;

            // Prepare data for InvoiceDetail
            const invoice_details = display_charge.map((display) => [
                display['display_type_id'],
                display['display_charge'],
                display['display_count'],
                display['no_of_days'],
                display['cost'],
                invoice_id
            ]);

            // Insert multiple rows into InvoiceDetail
            await pool.query(
                `INSERT INTO InvoiceDetail 
                    (display_type_id, display_charge, no_of_display, no_of_days, total_charge, invoice_id) 
                 VALUES ?`,
                [invoice_details]
            );

            // Insert into AdvertisementBill
            const [bill] = await pool.query(
                `INSERT INTO AdvertisementBill 
                    (ad_amt, total_amt, paid_amt, ad_bill_status, ads_id, invoice_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [total_cost, total_cost, 0, "Unpaid", ad_id, invoice_id]
            );

            // Return success response
            return {
                status: true,
                invoice_id: invoice_id,
                ad_bill_id: bill.insertId
            };

        } catch (error) {
            console.error(error);
            return {
                status: false,
                message: "An error occurred while creating the invoice."
            };
        }
    };

    static getAdsOfUser = async (req, res) => {
        try {
            const { user_id } = req.params;

            // Query to fetch advertisements of the user
            const [upload_ads] = await pool.query(
                `
                SELECT 
                ads.*, 
                ab.ad_bill_status,
                bt.business_type_name  -- Select only necessary columns
            FROM Advertisement AS ads
            LEFT JOIN BusinessType AS bt 
                ON ads.business_type_id = bt.business_type_id
            LEFT JOIN AdvertisementBill AS ab 
                ON ads.ads_id = ab.ads_id
            WHERE ads.user_id = ?
            ORDER BY ads.ads_id DESC;
                `,
                [user_id]
            );

            const [make_ads] = await pool.query(
                `
                SELECT *
                FROM MakeAdvertisement ads
                LEFT JOIN BusinessType bt ON ads.business_type_id = bt.business_type_id
                WHERE ads.user_id = ?
                ORDER BY ads.make_ad_id DESC
                `,
                [user_id]
            );
            console.log(upload_ads[0])

            res.status(200).json(
                {
                    status: true,
                    upload_ads: upload_ads,
                    make_ads: make_ads
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                message: "An error occurred while fetching advertisements."
            });
        }
    };


    static getAdDetails = async (req, res) => {
        try {
            const { ad_id } = req.params;

            // Fetching advertisement location data
            const [ad_location] = await pool.query(
                `
            SELECT 
                al.address_id,
                a.pin_code,
                a.area,
                a.cluster,
                a.district,
                a.state
            FROM AdvertisementLocation AS al
            INNER JOIN Address AS a
            ON al.address_id = a.address_id
            WHERE al.ads_id = ?;
            `, [ad_id]
            );

            // If no location found, return an error response
            if (!ad_location) {
                return res.status(404).json({
                    status: false,
                    message: "No advertisement location found"
                });
            }

            const result = ad_location.reduce((acc, row) => {
                const { state, district, cluster, area, address_id, pin_code } = row;

                // Initialize state if not already present
                if (!acc[state]) {
                    acc[state] = {};
                }

                // Initialize district under the state
                if (!acc[state][district]) {
                    acc[state][district] = {};
                }

                // Initialize cluster under the district
                if (!acc[state][district][cluster]) {
                    acc[state][district][cluster] = {};
                }

                // Initialize pin_code under the cluster
                if (!acc[state][district][cluster][pin_code]) {
                    acc[state][district][cluster][pin_code] = {};
                }

                // Initialize area under the pin_code
                if (!acc[state][district][cluster][pin_code][area]) {
                    acc[state][district][cluster][pin_code][area] = [];
                }

                // Add the address_id to the area
                if (!acc[state][district][cluster][pin_code][area].includes(address_id)) {
                    acc[state][district][cluster][pin_code][area].push(address_id);
                }

                return acc;
            }, {});

            // Reformatting ad_location into the required nested
            console.log(result)
            // Fetching invoice details
            const invoice = await this.getDisplayCostCalculation(ad_id);

            // Response
            return res.status(200).json({
                status: true,
                message: "Advertisement Details Fetch Successfully",
                ad_location: result,
                invoice: invoice
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Something Went Wrong"
            });
        }
    };

    static fetchAdsDisplay = async (req, res) => {
        try {
            const { address_ids, ad_id } = req.body;
            const [displays] = await pool.query(
                `select
                    ad.display_id,
                    d.display_img,
                    d.display_video,
                    dt.display_type,
                    c.client_business_name 
                    from AdvertisementDisplay as ad
                    inner join Display as d
                    on ad.display_id = d.display_id
                    join DisplayType as dt
                    on d.display_type_id = dt.display_type_id
                    join ClientBusiness as c
                    on d.client_business_id = c.client_business_id
                    join Address as a
                    on a.client_business_id = c.client_business_id
                    where a.address_id in (?) and ad.ads_id =  ?
                `, [address_ids, ad_id]
            )

            const result = displays.reduce((acc, row) => {
                const {
                    client_business_name,
                    display_id,
                    display_img,
                    display_video,
                    display_type,
                } = row;



                // Ensure client business exists under the area
                if (!acc[client_business_name]) {
                    acc[client_business_name] = {};
                }

                // Ensure display type exists under the client business
                if (!acc[client_business_name][display_type]) {
                    acc[client_business_name][display_type] = [];
                }

                // Add the display details under the respective display type
                acc[client_business_name][display_type].push({
                    display_id,
                    display_img,
                    display_video,
                });

                return acc;
            }, {});

            console.log(result);



            return res.status(200).json({
                status: true,
                displays: result,
                message: "Display Fetch Successfully"
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: "Something went wrong"
            })
        }
    }

}

export default Ads;
