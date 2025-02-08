import pool from "../../../Database/Database.mjs";
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvertisementDisplay {
  static fetchAdsForDisplay = async (req, res) => {
    try {
      const { display_id, ads_ids } = req.body;

      // Validate input parameters
      if (!display_id || !Array.isArray(ads_ids)) {
        return res.status(400).json({
          status: false,
          message: "Invalid data: display_id must be provided, and ads_ids must be an array.",
        });
      }

      // Handle empty ads_ids
      const adsIdsCondition = ads_ids.length > 0 ? `AND a.ads_id NOT IN (${ads_ids.map(() => '?').join(',')})` : '';

      const query = `
            SELECT
                a.ads_id,
                a.ad_type,
                a.ad_path,
                a.start_date,
                a.end_date
            FROM Advertisement AS a
            JOIN AdvertisementDisplay AS d
                ON d.ads_id = a.ads_id
            WHERE d.display_id = ?
                ${adsIdsCondition}
                AND a.start_date <= CURRENT_DATE()  
                AND a.end_date >= CURRENT_DATE() 
                AND a.ad_status = "Published";
        `;

      // Execute query
      const [ads] = await pool.query(query, [display_id, ...ads_ids]);

      if (ads.length === 0) {
        return res.status(400).json({
          status: false,
          message: "No ads found",
        });
      }

      // Send JSON response with ads and download URL
      return res.status(200).json({
        status: true,
        message: "Ads fetched successfully",
        ads: ads,
      });

    } catch (error) {
      console.error("Error fetching ads:", error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while fetching ads",
        error: error.message,
      });
    }
  };



  static downloadAds = async (req, res) => {
    try {
      const { ads_id } = req.params;
  
      // Validate ads_id
      if (!ads_id || isNaN(ads_id)) {
        return res.status(400).json({ error: "Invalid advertisement ID" });
      }
  
      // Fetch ad details from the database
      const [rows] = await pool.query(
        "SELECT ad_path FROM Advertisement WHERE ads_id = ?",
        [ads_id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
  
      const filePath = path.join(__dirname, "../../../../", rows[0].ad_path);
  
      // Get file stats to check existence and size
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          console.error("File not found:", err);
          return res.status(404).json({ error: "File not found on server" });
        }
  
        res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
        res.setHeader("Content-Length", stats.size);
        res.setHeader("Content-Type", "application/octet-stream");
  
        // Create a readable stream and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
  
        fileStream.on("error", (streamError) => {
          console.error("Stream error:", streamError);
          res.status(500).json({ error: "Error reading file" });
        });
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  
}

export default AdvertisementDisplay;
