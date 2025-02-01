import exp from "constants";
import pool from "../../../Database/Database.mjs";
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import moment from "moment";

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
    AND (a.ad_status = "Approved" OR a.ad_status = "Published");
`;


      // Execute query
      const [ads] = await pool.query(query, [display_id, ...ads_ids]);
      console.log(ads.length)
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
          const filePath = path.resolve(__dirname, "../../../../", ad.ad_path); // Adjust the file path
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
      const { display_status, display_id, ad_count } = req.body;
      if (!display_status) {
        return res.status(400).json({
          status: false,
          message: "Error"
        })
      }
      console.log(display_status)
      console.log(ad_count)

      const [charges] = await pool.query(
        `SELECT dt.display_charge, dt.client_charge
         FROM Display AS d
         LEFT JOIN DisplayType AS dt ON d.display_type_id = dt.display_type_id
         WHERE d.display_id = ?`, 
         [display_id]
      );
      const totalInactiveMinutes = 8 * 60;
      console.log(charges[0])
      const total_amt = ad_count* charges[0].display_charge
      const client_total_amt = total_amt*charges[0].client_charge/100
      const owner_amt_prct = charges[0].client_charge
      const per_min_charge = (client_total_amt * (owner_amt_prct / 100)) / totalInactiveMinutes;




      const data = {};
      display_status.forEach(status => {
        const date = status.date;
        const start_time = moment(status.start_time, 'HH:mm:ss');
        const end_time = moment(status.end_time, 'HH:mm:ss');
        const active_time = moment.duration(end_time.diff(start_time)).asMinutes();


        if (data[date]) {
          data[date].active_time += active_time;
        } else {
          data[date] = {
            active_time: active_time
          };
        }
      });



      console.log(data);
     

      for (const date of Object.keys(data)) {
        const inactive_time = totalInactiveMinutes - data[date].active_time;

        data[date].inactive_time = inactive_time < 0 ? 0 : inactive_time; // Correct key assignment

        // Execute the query correctly with await
        const [display_earning] = await pool.query(
          `SELECT * FROM DisplayEarning WHERE earning_date = ? AND display_id = ?`,
          [date, display_id]
        );

        if (display_earning.length > 0) {
          let earning = display_earning[0];
          data[date].active_time += earning.active_time
          let inactive_time = totalInactiveMinutes - data[date].active_time;
          let fine = 0;
          if(data[date].active_time>=totalInactiveMinutes){
            earning = totalInactiveMinutes *per_min_charge 
          }else{
            earning = data[date].active_time*per_min_charge
            fine = inactive_time * per_min_charge
          }
          await pool.query(
            `UPDATE DisplayEarning 
             SET total_earning = ?, fine = ?, earning = ?, ad_count = ?, active_time = ?, inactive_time = ? 
             WHERE display_id = ? AND earning_date = ?`,
            [earning, fine, client_total_amt, ad_count, data[date].active_time, inactive_time, display_id, date]
          );
          
        } else {
          let fine = 0;
          let earning = 0;
          if(data[date].active_time>=totalInactiveMinutes){
            earning = totalInactiveMinutes *per_min_charge 
          }else{
            earning = data[date].active_time*per_min_charge
            fine = data[date].inactive_time * per_min_charge
          }
          await pool.query(
            `INSERT INTO DisplayEarning (active_time, inactive_time, earning_date, display_id,total_earning,fine,earning) VALUES (?, ?, ?, ?,?,?,?)
            `, [data[date].active_time, data[date].inactive_time, date, display_id,earning, fine, client_total_amt,]
          )
        }
      }

      return res.status(200).json({
        status: true,
        message: "Data uploaded successfuly"
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });

    }
  }
}

export default AdvertisementDisplay;
