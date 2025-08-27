import pool from "../../../Database/Database.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Leads {
  // ✅ Create Lead
  static createLead = async (req, res) => {
    try {
      const {
        name,
        org_name,
        email,
        mobile,
        contact_date,
        follow_up_date,
        lead_type,
        remark,
        user_id,
      } = req.body;

      if (!name || !mobile || !user_id) {
        return res.status(400).json({
          status: false,
          message: "Required fields missing (name, mobile, user_id)",
        });
      }

      let visiting_card_path = null;

      if (req.file) {
        const visiting_card = req.file;
        const folder_path = `Visiting_Cards`;
        const base_dir = path.resolve(__dirname, `../../../../Media/${folder_path}`);

        if (!fs.existsSync(base_dir)) {
          fs.mkdirSync(base_dir, { recursive: true });
        }

        const file_extension = path.extname(visiting_card.originalname) || ".jpg";
        const new_file_name = `${visiting_card.fieldname}_${Date.now()}${file_extension}`;
        const new_path = path.join(base_dir, new_file_name);

        fs.renameSync(visiting_card.path, new_path);

        visiting_card_path = path.relative(
          path.resolve(__dirname, "../../../../"),
          new_path
        );
      }

      const [result] = await pool.query(
        `INSERT INTO Leads 
        (name, org_name, email, mobile, contact_date, follow_up_date, lead_type, remark, user_id, visiting_card_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          org_name,
          email,
          mobile,
          contact_date,
          follow_up_date,
          lead_type,
          remark,
          user_id,
          visiting_card_path,
        ]
      );

      return res.status(201).json({
        status: true,
        message: "Lead created successfully",
        data: { lead_id: result.insertId },
      });
    } catch (error) {
      console.error("Error in createLead:", error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while creating lead",
      });
    }
  };

  // ✅ Fetch leads for logged-in user (sorted by follow_up_date)
  static fetchUserLeads = async (req, res) => {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          status: false,
          message: "User ID is required",
        });
      }

      // 👇 Display Leads of this user
      const [displayLeads] = await pool.query(
        `SELECT * FROM Leads 
         WHERE user_id = ? AND lead_type = 'Display' 
         ORDER BY follow_up_date ASC`,
        [user_id]
      );

      // 👇 Ads Leads of this user
      const [adsLeads] = await pool.query(
        `SELECT * FROM Leads 
         WHERE user_id = ? AND lead_type = 'Ads' 
         ORDER BY follow_up_date ASC`,
        [user_id]
      );

      return res.status(200).json({
        status: true,
        message: "User leads fetched successfully",
        display_leads: displayLeads,
        ads_leads: adsLeads,
      });
    } catch (error) {
      console.error("Error in fetchUserLeads:", error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while fetching user leads",
      });
    }
  };
}

export default Leads;
