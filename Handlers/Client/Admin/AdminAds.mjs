import pool from "../../../Database/Database.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AdminAds {
  static getAdminAds = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT filename, filetype FROM uploads");
      const ads = []
      for (const row of rows) {
        const filePath = path.join(__dirname, "../../../../admin/website_ads/", row.filename);

        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const base64File = fileBuffer.toString("base64");

            ads.push({
                filename: row.filename,
                type: row.filetype,
                base64: base64File
            });
        }
    }

      res.json({ success: true, ads });
    } catch (error) {
      console.error("Error fetching admin ads:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
}

export default AdminAds;
