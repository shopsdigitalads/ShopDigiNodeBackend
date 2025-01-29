import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import Utils from '../../../Utils/utils.mjs';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import pool from '../../../Database/Database.mjs';

class Display {
  static addDisplay = async (req, res) => {
    try {
      console.log("Processing request...");

      const {
        display_type_id,
        client_business_id,
        client_business_name,
        user_id,
        name,
        display_type
      } = req.body;
      console.log(display_type_id)
      if (!display_type_id || !client_business_id || !client_business_name || !user_id || !name || !display_type) {
        console.log("here")
        return res.status(400).json({
          status: false,
          message: "Data Missing",
        });
      }

      const folder_path = `${user_id}_${name}/${client_business_name}`;
      const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_path}`);

      // Create directory if it doesn't exist
      if (!fs.existsSync(base_dir)) {
        fs.mkdirSync(base_dir, { recursive: true });
      }

      const files = req.files || {};
      const required_files = ["display_img", "display_video"];
      const file_paths = {};

      // console.log(files)

      // Process each required file
      for (const file of required_files) {
        if (files[file] && files[file][0]) {
          const old_path = files[file][0].path;
          const file_extension = path.extname(files[file][0].originalname) || ".jpg";
          const new_file_name = `${file}_${display_type}_${Date.now()}${file_extension}`;
          const new_path = path.join(base_dir, new_file_name);

          fs.renameSync(old_path, new_path);
          file_paths[file] = path.relative(path.resolve(__dirname, "../../../../"), new_path);
        } else {
          return res.status(400).json({
            status: false,
            message: `Missing file: ${file}`,
          });
        }
      }

      // Insert data into the database
      const [result] = await pool.query(
        `
        INSERT INTO Display (display_img, display_video, display_type_id, client_business_id)
        VALUES (?, ?, ?, ?)
        `,
        [
          file_paths["display_img"],
          file_paths["display_video"],
          display_type_id,
          client_business_id,
        ]
      );

      if (result.affectedRows === 1) {
        console.log("here")
        return res.status(201).json({
          status: true,
          message: "Display added successfully",
        });
      } else {
        throw new Error('Failed to insert data into database');
      }
    } catch (error) {
      // console.error("Error:", error);
      return res.status(500).json({
        status: false,
        message: "An error occurred",
      });
    }
  };

  static updateDisplay = async (req, res) => {
    try {
      const { field, data, client_business_id, client_business_name, name, user_id, display_id,
        display_type } = req.body;  
      const update_field = JSON.parse(field)
      const update_data = JSON.parse(data)
      console.log(update_data)
      if (!update_data || !update_field || !client_business_id || !client_business_name || !name || !user_id || !display_type) {
        return res.status(400).json({
          status: false,
          message: "Data Missing"
        })
      }
    
      if (!Array.isArray(update_field) || !Array.isArray(update_data) || update_field.length !== update_data.length) {
        return res.status(400).json({
          status: false,
          message: "Invalid input"
        });
      }

    
      
      const allowed_fields = ['display_type_id', 'client_business_id'];

      if (!update_field.every(field => allowed_fields.includes(field))) {
        return res.status(400).json({
          status: false,
          message: "Invalid field"
        });
      }
     
      const allowed_update_imgs = ['display_img', 'display_video'];
      const received_fields = Object.keys(req.files);
      const valid_files = {};

      received_fields.forEach(field => {
        if (allowed_update_imgs.includes(field)) {
          valid_files[field] = req.files[field];
        }
      });

      const i_files = Object.keys(valid_files)
      const file_path = [];
      if (Object.keys(valid_files).length > 0) {
        const folder_name = `${user_id}_${name}/${client_business_name}`;
        const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_name}`);
        const files = req.files;
        for (const field of i_files) {
          if (files[field][0]) {
            const old_path = files[field][0].path;
            const file_extension = path.extname(files[field][0].originalname) || ".jpg";
            const new_file_name = `${field}_${display_type}_${Date.now()}${file_extension}`;
            const new_path = path.join(base_dir, new_file_name);
            fs.renameSync(old_path, new_path);
            file_path.push(path.relative(path.resolve(__dirname, "../../../"), new_path));
          } else {
           
            return res.status(400).json({
              status: false,
              message: `Data Missing`
            });
          }
        }
      }
 
      const final_fields = update_field.concat(i_files);
      const update_query = final_fields.join(" = ?,") + " = ?"
      const query = `UPDATE Display SET display_status = "On Review", ${update_query} WHERE display_id = ?`;
      const final_data = update_data.concat(file_path)
      final_data.push(display_id);

      const [updated_display] = await pool.query(query, final_data);

      console.log(updated_display.affectedRows);
      if (updated_display.affectedRows !== 1) {
        return res.status(404).json(
          {
            status: false,
            message: "No record updated"
          }
        )
      }
      return res.status(200).json({
        status: true,
        message: 'Successfully updated'
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: true,
        message: "An Error occured"
      })
    }
  }

  static getDisplayWithArea = async (req, res) => {
    try {
      const { address_ids } = req.body;

      // Validate the request body
      if (!Array.isArray(address_ids) || address_ids.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid or missing address_ids or business_type_id",
        });
      }

      // Query to fetch all relevant displays based on the given conditions
      const query = `
        SELECT 
          a.area,
          c.client_business_name,
          d.display_id,
          d.display_img,
          d.display_video,
          dt.display_charge,
          dt.display_type
        FROM Address a
        INNER JOIN ClientBusiness AS c
          ON a.client_business_id = c.client_business_id
        INNER JOIN Display AS d
          ON d.client_business_id = c.client_business_id
        INNER JOIN DisplayType AS dt
          ON d.display_type_id = dt.display_type_id
        WHERE address_id IN (?) 
          AND (d.display_status = "Active" OR d.display_status = "Approved");
      `;

      // Execute the query with the provided parameters
      const [rows] = await pool.query(query, [address_ids]);

      // Transform the result into the desired format
      const result = rows.reduce((acc, row) => {
        const {
          area,
          client_business_name,
          display_id,
          display_img,
          display_video,
          display_charge,
          display_type,
        } = row;

        // Ensure area exists in the result object
        if (!acc[area]) {
          acc[area] = {};
        }

        // Ensure client business exists under the area
        if (!acc[area][client_business_name]) {
          acc[area][client_business_name] = {};
        }

        // Ensure display type exists under the client business
        if (!acc[area][client_business_name][display_type]) {
          acc[area][client_business_name][display_type] = [];
        }

        // Add the display details under the respective display type
        acc[area][client_business_name][display_type].push({
          display_id,
          display_img,
          display_video,
          display_charge,
        });

        return acc;
      }, {});

      console.log(result);
      return res.status(200).json({
        status: true,
        message: "Displays fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while fetching displays",
      });
    }
  };



  static getDisplayTypes = async (req, res) => {
    try {
      const [display_type] = await pool.query('SELECT display_type_id,display_type from DisplayType');
      console.log(display_type);

      return res.status(200).json({
        status: true,
        display_type: display_type,
        message: "Display Type Fetch Successfully"
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: false,
        message: "Error In Fetching Display Types"
      })
    }
  }

 static getDisplayHistory = async(req,res)=>{
  try {
    const {display_id} = req.params;
    if(!display_id){
      return res.status(400).json({
        status:false,
        message:"Display ID Missing"
      })
    }

    const [display_earning] = await pool.query(
      `SELECT * FROM DisplayEarning WHERE display_id = ?`,[display_id]
    )

    return res.status(200).json({
      status:true,
      message:"Display History Fetch Successfully",
      display_earning:display_earning
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      status:false,
      message:"Inernal Server Error"
    })
  }
 } 

}



export default Display;
