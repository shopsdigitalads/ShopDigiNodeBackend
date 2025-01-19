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
            console.log(address_id,ad_id)
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
                `INSERT INTO AdvertistmentLocation (address_id, ads_id) VALUES ?`,
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
                ad_location_ids:ad_location_ids,
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
            const { displays, ad_id, inner, outer, standee } = req.body;

            if (!displays || !ad_id || !Array.isArray(displays)) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing",
                });
            }

            // Prepare the values for bulk insert
            const values = displays.map((display) => [
                display.ad_location_id,
                display.display_id,
                ad_id,
            ]);

            // Bulk insert query
            const [result] = await pool.query(
                `INSERT INTO AdvertistmentDisplay (ad_location_id, display_id, ads_id) VALUES ?`,
                [values]
            );

            /// Calculate charges
            const inner_charge = inner.no_of_display * inner.charge;
            const outer_charge = outer.no_of_display * outer.charge;
            const standee_charge = standee.no_of_display * standee.charge;
            const total_charge = inner_charge + outer_charge + standee_charge;


            const [invoice] = await pool.query(
                `INSERT INTO Invoice (total_charge, ads_id) VALUES (?, ?)`,
                [total_charge, ad_id]
            );

            // Prepare values for InvoiceDetail
            const invoiceDetails = [
                ['inner', inner.charge, inner.no_of_display, inner_charge, invoice.insertId],
                ['outer', outer.charge, outer.no_of_display, outer_charge, invoice.insertId],
                ['standee', standee.charge, standee.no_of_display, standee_charge, invoice.insertId],
            ];

            // Bulk insert into InvoiceDetail table
            const [invoiceDetail] = await pool.query(
                `INSERT INTO InvoiceDetail (display_type, display_charge, no_of_display, total_charge, invoice_id) VALUES ?`,
                [invoiceDetails]
            );

            console.log('Invoice and invoice details inserted successfully');

            const [bill] = await pool.query( `
                INSERT INTO AdvertistmentBill (ad_amt,ad_bill_status,,ads_id) , VALUES(?,?,?)
                `,[total_charge,"Unpaid",ad_id]);



            // Response with inserted data
            return res.status(201).json({
                status: true,
                message: "Displays added successfully",
                insertedCount: result.affectedRows,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred",
            });
        }
    };

}

export default Ads;
