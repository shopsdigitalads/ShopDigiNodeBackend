import pool from '../../../Database/Database.mjs';
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Ads {
    static createAdd = async (req, res) => {
        try {
            const { make_ad_type, make_ad_description, make_ad_goal, business_type_id, budget, user_id } = req.body;

            if (!make_ad_type || !make_ad_description || !make_ad_goal || !business_type_id || !budget || !user_id) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            const [ad] = await pool.query(`
            INSERT INTO MakeAdvertistment (make_ad__type,make_ad_description,make_ad_goal,business_type_id,budget,user_id) VALUES(?,?,?,?,?,?)
            `, [make_ad_type, make_ad_description, make_ad_goal, business_type_id, budget, user_id])

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

    static upload = async (req, res) => {
        try {
            const { ad_type, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, name, emp_id } = req.body

            if (!ad_type || !ad_description || !ad_goal || !start_date || !end_date || !business_type_id || !user_id || !name || !req.file) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            const ad = req.file

            const folder_path = `${user_id}_${name}/Advertistment`;
            const base_dir = path.resolve(__dirname, `../../../Media/Client/${folder_path}`);

            // Create directory if it doesn't exist
            if (!fs.existsSync(base_dir)) {
                fs.mkdirSync(base_dir, { recursive: true });
            }

            const old_path = ad.path;
            const file_extension = path.extname(ad.originalname) || ".jpg";
            const new_file_name = `${ad.fieldname}_${Date.now()}${file_extension}`;
            const new_path = path.join(base_dir, new_file_name);

            fs.renameSync(old_path, new_path);
            const ad_path = path.relative(path.resolve(__dirname, "../../"), new_path);


            const [advertistment] = await pool.query(
                `INSERT INTO Advertistment (ad_type,ad_path,ad_description,ad_goal,start_date,end_date,business_type_id,user_id,emp_id) VALUES(?,?,?,?,?,?,?,?,?)`, [ad_type, ad_path, ad_description, ad_goal, start_date, end_date, business_type_id, user_id, emp_id]
            )

            if (advertistment.affectedRows === 1) {
                return res.status(201).json({
                    status: true,
                    ads_id: advertistment.insertId,
                    message: "Advertistment Uploaded Succesfully. You can select area where you want to show it."
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
                `INSERT IGNORE INTO AdvertistmentLocation (address_id, ads_id) VALUES ?`,
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
                `INSERT IGNORE INTO AdvertistmentDisplay (display_id, ads_id) VALUES ?`,
                [values]
            );

            const calculation = await this.getDisplayCostCalculation(ad_id)

            console.log(calculation)
            const bill = await this.createInvoice(ad_id,calculation.total_cost,calculation.display_charge);
            console.log(bill)
            return res.status(201).json({
                status: true,
                message: "Displays added successfully",
                insertedCount: result.affectedRows,
                calculation:calculation,
                bill:bill
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred",
            });
        }
    };

    static getDisplayCostCalculation = async(ad_id) =>{
        try {
            const [no_of_days] = await pool.query(`
                select SUM(DATEDIFF(A.end_date, A.start_date) + 1) AS total_days 
                from Advertistment as A where ads_id = ?
                `, [ad_id])

            const  [display_charge] = await pool.query(`
                SELECT 
                DT.display_type_id,
                DT.display_charge,
                DT.display_type,
                COUNT(AD.ad_display_id) AS display_count
                FROM 
                    AdvertistmentDisplay AD
                JOIN 
                    Display D ON AD.display_id = D.display_id
                JOIN 
                    DisplayType DT ON D.display_type_id = DT.display_type_id
                WHERE 
                    AD.ads_id = ?
                GROUP BY 
                DT.display_type_id, DT.display_type, DT.display_charge;
                `,[ad_id])

            
            let final_cost = 0
            const days = no_of_days[0].total_days;
            for(const display of display_charge){
                display['no_of_days'] = days
                display['cost'] = days*display['display_charge']*display['display_count']
                final_cost = final_cost+ display['cost']
            }

            return {
                status:true,
                 total_cost:final_cost,
                 display_charge:display_charge
            }
        } catch (error) {
            console.log(error)
            return{
                status:false
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
                    (display_type, display_charge, no_of_display, no_of_days, total_charge, invoice_id) 
                 VALUES ?`,
                [invoice_details]
            );
    
            // Insert into AdvertistmentBill
            const [bill] = await pool.query(
                `INSERT INTO AdvertistmentBill 
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
                SELECT *
                FROM Advertistment ads
                LEFT JOIN BusinessType bt ON ads.business_type_id = bt.business_type_id
                WHERE ads.user_id = ?
                ORDER BY ads.ads_id DESC
                `,
                [user_id]
            );

            const [make_ads] = await pool.query(
                `
                SELECT *
                FROM MakeAdvertistment ads
                LEFT JOIN BusinessType bt ON ads.business_type_id = bt.business_type_id
                WHERE ads.user_id = ?
                ORDER BY ads.make_ad_id DESC
                `,
                [user_id]
            );
    
        
            res.status(200).json(
                { 
                    status:true,
                    upload_ads:upload_ads,
                    make_ads:make_ads
                     }
                );
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                status:false,
                message: "An error occurred while fetching advertisements." });
        }
    };
    
    

}

export default Ads;
