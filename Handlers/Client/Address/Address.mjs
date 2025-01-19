import { response } from 'express';
import pool from '../../../Database/Database.mjs'

class Address {

    static add = async (req, res) => {
        try {
            const {
                pin_code,
                area,
                cluster,
                district,
                state,
                google_map_location,
                address_type,
                user_id,


            } = req.body;
            const client_business_id = req.client_business_id
            if (!pin_code || !area || !cluster || !district || !state || !address_type) {
                return {
                    status: false,
                    code: 400,
                    message: "Missing required fields. Please provide pin_code, area, cluster, district, state, and address_type.",
                }
            }

            if (address_type === "Home" && !user_id) {
                return {
                    status: false,
                    code: 400,
                    message: "Missing user_id for address type 'Home'.",
                };
            }

            if (address_type === "Business" && !client_business_id) {
                return {
                    status: false,
                    code: 400,
                    message: "Missing client_business_id for address type 'Business'.",
                };
            }

            const idField = address_type === "Home" ? "user_id" : "client_business_id";
            const idValue = address_type === "Home" ? user_id : client_business_id;

            const query = `
                INSERT INTO Address (
                    pin_code, 
                    area, 
                    cluster, 
                    district, 
                    state, 
                    google_map_location, 
                    address_type,
                    ${idField}
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?,?)
            `;

            const [result] = await pool.query(query, [
                pin_code,
                area,
                cluster,
                district,
                state,
                google_map_location,
                address_type,
                idValue,
            ]);

            return {
                status: true,
                code: 201,
                address_id: result.insertId,
                message: "Address added successfully.",
            };

        } catch (error) {
            console.error("Error adding address:", error);
            return {
                status: false,
                code: 500,
                message: "An error occurred while adding the address.",
            };
        }
    }

    static addAddress = async (req, res) => {
        try {
            const address = await Address.add(req, res);
            console.log(address)
            return res.status(address.code).json({
                address
            })
        } catch (error) {
            console.error("Error adding address:", error);
            return res.status(500).json({
                status: false,
                message: "An error occurred while adding the address.",
            });
        }
    };




    static updateAddress = async (req, res) => {
        try {
            const { update_field, update_data } = req.body;
            if (!update_data || !update_field) {
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            if (!Array.isArray(update_field) || !Array.isArray(update_data) || update_field.length !== update_data.length - 1) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid input"
                });
            }

            const allowed_fields = ['pin_code', 'area', 'cluster', 'district', 'state', 'google_map_location'];
            if (!update_field.every(field => allowed_fields.includes(field))) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid field"
                });
            }

            let fields = update_field.join(" = ?,") + " = ?";
            const query = `UPDATE Address SET ${fields} WHERE address_id = ?`;
            const [updated_address] = await pool.query(query, update_data);

            console.log(updated_address.affectedRows);
            if (updated_address.affectedRows !== 1) {
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
                status: false,
                message: 'An error occurred while updating the record',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static getAddressForAds = async (req, res) => {
        try {
            const {business_type_id} = req.params;
            const query = `
            SELECT 
              state, 
              district, 
              cluster, 
              area, 
              address_id, 
              pin_code
            FROM Address as a
            INNER JOIN ClientBusiness as c
            on a.client_business_id = c.client_business_id
            WHERE c.business_type_id != ? and c.client_business_status ="Approved"
            ORDER BY state, district, cluster, pin_code, area;
          `;

            // Execute the query
            const [rows] = await pool.query(query,[business_type_id]);

            // Transform the data into the desired nested format
            const result = rows.reduce((acc, row) => {
                const { state, district, cluster, area, address_id, pin_code } = row;

                // Initialize state if not already present
                if (!acc[state]) {
                    acc[state] = {};
                }

                // Initialize district under the state
                if (!acc[state][district]) {
                    acc[state][district] = {};
                }

                // Initialize cluster under the district
                if (!acc[state][district][cluster]) {
                    acc[state][district][cluster] = {};
                }

                // Initialize pin_code under the cluster
                if (!acc[state][district][cluster][pin_code]) {
                    acc[state][district][cluster][pin_code] = {};
                }

                // Initialize area under the pin_code
                if (!acc[state][district][cluster][pin_code][area]) {
                    acc[state][district][cluster][pin_code][area] = [];
                }

                // Add the address_id to the area
                if (!acc[state][district][cluster][pin_code][area].includes(address_id)) {
                    acc[state][district][cluster][pin_code][area].push(address_id);
                }

                return acc;
            }, {});

            // Return the result
            return res.status(200).json({
                status: true,
                message: "Addresses fetched successfully",
                data: result,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "An error occurred while fetching addresses",
            });
        }
    };




}

export default Address;