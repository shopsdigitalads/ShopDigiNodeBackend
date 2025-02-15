import pool from '../../../Database/Database.mjs'
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class KYC {
    static applyForKYC = async (req, res) => {
        try {
            console.log(req.files)
            const { adhar_no, pan_no, acc_holder_name, acc_no, bank_ifsc, bank_name, bank_branch_name, name, user_id } = req.body;

            if (!adhar_no || !pan_no || !acc_holder_name || !acc_no || !bank_ifsc || !bank_name || !bank_branch_name) {
                console.log("here");
                return res.status(400).json({
                    status: false,
                    message: "Data Missing"
                })
            }

            const folder_name = `${user_id}_${name}`;

            const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_name}`);
            if (!fs.existsSync(base_dir)) {
                fs.mkdirSync(base_dir, { recursive: true });
            }

            const files = req.files || {};
            const req_files = [
                'adhar_front_img', 'adhar_back_img', 'pan_img', 'bank_proof_img'
            ]

            const file_path = {};

            for (const file of req_files) {
                if (files[file] && files[file][0]) {
                    const old_path = files[file][0].path;
                    const new_file_name = `${file}.jpg`;
                    const new_path = path.join(base_dir, new_file_name);
                    fs.renameSync(old_path, new_path);
                    file_path[file] = path.relative(path.resolve(__dirname, "../../../../"), new_path);
                } else {
                    console.log(file)
                    return res.status(400).json({
                        status: false,
                        message: "Data Missing"
                    })
                }
            }


            const query = `
                INSERT INTO KYC(
                    adhar_no,pan_no,adhar_front_img,adhar_back_img,pan_img,acc_holder_name,acc_no,bank_ifsc,bank_name,bank_branch_name,bank_proof_img,user_id
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
                 `
            const values = [
                adhar_no, pan_no, file_path['adhar_front_img'], file_path['adhar_back_img'], file_path['pan_img'], acc_holder_name, acc_no, bank_ifsc, bank_name, bank_branch_name, file_path['bank_proof_img'], user_id
            ];

            const [kyc] = await pool.query(query, values);
            console.log(kyc)
            if (kyc.affectedRows === 1) {
                return res.status(201).json({
                    status: true,
                    message: "KYC details upload successfully"
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

    static updateKYC = async (req, res) => {
        try {
            const { field, data, name, user_id } = req.body;

            const update_field = JSON.parse(field)
            const update_data = JSON.parse(data);

            if (!update_data || !update_field) {

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

            const allowed_fields = ['adhar_no', 'pan_no', 'acc_holder_name', 'acc_no', 'bank_ifsc', 'bank_name', 'bank_branch_name',"update_request"];
            if (!update_field.every(field => allowed_fields.includes(field))) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid field"
                });
            }

            const allowed_update_imgs = ['adhar_front_img', 'adhar_back_img', 'pan_img', 'bank_proof_img'];
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
                const folder_name = `${user_id}_${name}`;
                const base_dir = path.resolve(__dirname, `../../../../Media/Client/${folder_name}`);
                const files = req.files;
                for (const field of i_files) {
                    if (files[field][0]) {
                        const old_path = files[field][0].path;
                        const new_file_name = `${field}.jpg`;
                        const new_path = path.join(base_dir, new_file_name);
                        fs.renameSync(old_path, new_path);
                        file_path.push(path.relative(path.resolve(__dirname, "../../../../"), new_path));
                    } else {
                        return res.status(400).json({
                            status: false,
                            message: `Data Missing`
                        });
                    }
                }
            }

            const final_fields = update_field.concat(i_files);
            const update_query = final_fields.map(field => `${field} = ?`).join(", ");
            const query = `UPDATE KYC SET ${update_query} WHERE user_id = ?`;

         
            const final_data = update_data.concat(file_path);
            final_data.push(user_id);

            const [updated_kyc] = await pool.query(query, final_data);


            console.log(updated_kyc.affectedRows);
            if (updated_kyc.affectedRows !== 1) {
                console.log("here");
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
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'An error occurred while updating the record',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static getKycOfUser = async (req, res) => {
        try {
            const { user_id } = req.params;
            const [kyc] = await pool.query(
                `
                SELECT * From KYC WHERE user_id = ?`
                , [user_id]
            )

            return res.status(200).json({
                status: true,
                message: "KYC Fetch Successfully",
                kyc: kyc
            })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Something Went Wrong"
            })
        }
    }


    static updateRequest = async(req,res)=>{
        try {
          const {remark,kyc_id} = req.body;
          if(!remark || !kyc_id){
            return res.status(400).json({
              status:false,
              message:"Data Missing"
            })
          }
    
          const [update_kyc] = await pool.query(`UPDATE KYC set kyc_remark = ?,update_request = "Submitted" where kyc_id = ?`,[remark,kyc_id])
    
          return res.status(200).json({
            status:true,
            message:"Request Submitted"
          })
        } catch (error) {
          console.log(error)
          return res.status(500).json({
            status:false,
            message:"Internal Server Errro"
          })
        }
      }


}

export default KYC;