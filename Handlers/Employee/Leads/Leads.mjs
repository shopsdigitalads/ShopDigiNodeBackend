
import pool from "../../../Database/Database.mjs"
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



class Leads {
    static createLead = async (req, res) => {
        try {
            console.log("here");
            const { name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark, user_id } = req.body;
            console.log(name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark, user_id);
    
            // Check for missing data
            if (!name || !mobile || !user_id) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                });
            }
            console.log("here");
    
            let visiting_card_path = null;
            if (req.file) {
                const visiting_card = req.file;
                const folder_path = `Visiting_Cards`;
                const base_dir = path.resolve(__dirname, `../../../../Media/${folder_path}`);
    
                // Create directory if it doesn't exist
                if (!fs.existsSync(base_dir)) {
                    fs.mkdirSync(base_dir, { recursive: true });
                }
    
                const file_extension = path.extname(visiting_card.originalname) || ".jpg";
                const new_file_name = `${visiting_card.fieldname}_${Date.now()}${file_extension}`;
                const new_path = path.join(base_dir, new_file_name);
    
                fs.renameSync(visiting_card.path, new_path);
                visiting_card_path = path.relative(path.resolve(__dirname, "../../../../"), new_path);
            }
    
            // Insert Query (Corrected)
            const [leads] = await pool.query(
                `INSERT INTO Leads (name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark, user_id, visiting_card_path) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark, user_id, visiting_card_path]
            );
            console.log(leads);
            return res.status(201).json({
                status: true,
                message: "Lead created successfully",
                data: leads // Optional: Return inserted lead data
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred"
            });
        }
    };

    static fetchSortedLeads = async (req, res) => {
        try {
            // Query to fetch leads with type 'Display', sorted by follow_up_date
            const [displayLeads] = await pool.query(
                `SELECT * FROM Leads WHERE lead_type = 'Display' ORDER BY follow_up_date ASC`
            );

            // Query to fetch leads with type 'Ads', sorted by follow_up_date
            const [adsLeads] = await pool.query(
                `SELECT * FROM Leads WHERE lead_type = 'Ads' ORDER BY follow_up_date ASC`
            );

            return res.status(200).json({
                status: true,
                message: "Leads fetched successfully",
                display_leads: displayLeads,
                ads_leads: adsLeads
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred while fetching leads"
            });
        }
    };

}

export default Leads;