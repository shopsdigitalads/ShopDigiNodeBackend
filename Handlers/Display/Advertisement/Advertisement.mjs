import exp from "constants";
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

      // Construct query
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
          AND a.start_date >= CURRENT_DATE()
          AND (a.ad_status = "Approved" OR a.ad_status = "Published");
      `;

      // Execute query
      const [ads] = await pool.query(query, [display_id, ...ads_ids]);

      // Handle no results
      if (ads.length === 0) {
        return res.status(400).json({
          status: false,
          message: "No ads found",
        });
      }

      // Attach file content to each ad
      const adsWithFiles = [];
      for (const ad of ads) {
        try {
          // Resolve the file path
          const filePath = path.resolve(__dirname, "../../../", ad.ad_path); // Adjust the file path
          const fileContent = fs.readFileSync(filePath, { encoding: "base64" }); // Read and encode file as Base64
          adsWithFiles.push({
            ...ad,
            file: fileContent, // Add file content to the ad object
          });
        } catch (err) {
          console.error(`Error reading file for ads_id ${ad.ads_id}:`, err);
          adsWithFiles.push({
            ...ad,
            file: null, // Add null if file is not found or cannot be read
            error: "File not found or could not be read",
          });
        }
      }

      console.log(adsWithFiles)
      // Success response
      return res.status(200).json({
        status: true,
        message: "Ads fetched successfully",
        ads: adsWithFiles,
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

  static displayStatus = async (req, res) => {
    try {
      const { display_status, display_id } = req.body;
      if (!display_status) {
        return res.status(400).json({
          status: false,
          message: "Error"
        })
      }
      console.log(display_status)
      console.log(display_id)

      return res.status(200).json({
        status: true,
        message: "Data uploaded successfuly"
      })
    } catch (error) {

    }
  }
}

export default AdvertisementDisplay;
