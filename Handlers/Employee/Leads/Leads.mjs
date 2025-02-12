
import pool from "../../../Database/Database.mjs"

class Leads {
    static createLead = async (req, res) => {
        try {
            console.log("here")
            const { name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark,user_id } = req.body;
            console.log(name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark,user_id )
            // Check for missing data
            if (!name || !org_name || !email || !mobile || !contact_date || !follow_up_date || !lead_type || !user_id) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                });
            }
            console.log("here")
            // Insert Query (Corrected)
            const [leads] = await pool.query(
                `INSERT INTO Leads (name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark,user_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
                [name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark,user_id]
            );
            console.log(leads)
            return res.status(200).json({
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