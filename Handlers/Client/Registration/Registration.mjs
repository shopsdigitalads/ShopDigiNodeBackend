import pool from '../../../Database/Database.mjs'
import Utils from '../../../Utils/utils.mjs';



class Register {

  static register = async (req, res) => {
    try {
      const {
        first_name, middle_name, last_name, mobile, email, role,emp_id
      } = req.body;
     
      if (!first_name || !middle_name || !last_name || !mobile || !email || !role) {
        return res.status(404).json({
          status: false,
          message: "Data Missing!"
        });
      }

      const query = `
        INSERT INTO Users (first_name, middle_name, last_name, mobile, email, role, emp_id) VALUES(?,?,?,?,?,?,?)
      `;
      const values = [first_name, middle_name, last_name, mobile, email, role,emp_id];
      const [result] = await pool.query(query, values);
      console.log(result);
      const user_id = result.insertId;
  
      if (emp_id) {
        console.log("here3");
        return res.status(201).json({
          status: true,
          user_id: user_id,
          message: 'Registered successfully'
        });
      }
  
      const payload = {
        user_id: user_id,
        mobile: mobile,
        role: role
      };
  
      const token = Utils.generateToken(payload);
      
      return res.status(201).json({
        status: true,
        token: token,
        user_id: user_id,
        message: 'Registered successfully'
      });
  
    } catch (error) {
      console.error(error.sqlMessage);
      var message = 'Error registering client';
      if (error.sqlMessage) {
        message = error.sqlMessage;
      }
      return res.status(500).json({
        status: false,
        message: error.sqlMessage ? error.sqlMessage : "Registration Failed"
      });
    }
  };



    static update = async (req, res) => {
    try {
      const { update_field, update_data } = req.body; 

      if (!update_data || !update_field) {
        return res.status(400).json({
          status: false,
          message: "Data Missing"
        })
      }

      if (!Array.isArray(update_field) || !Array.isArray(update_data) || update_field.length !== update_data.length-1) {
        return res.status(400).json({
          status: false,
          message: "Invalid input"
        });
      }

      const allowed_fields = ['first_name', 'last_name', 'middle_name','mobile','email'];
      if (!update_field.every(field => allowed_fields.includes(field))) {
        return res.status(400).json({
          status: false,
          message: "Invalid field"
        });
      }
     
      let fields = update_field.join(" = ?,") + " = ?";
      const query = `UPDATE Users SET ${fields} WHERE user_id = ?`;
      const [updated_user] = await pool.query(query,update_data);
    
      console.log(updated_user.affectedRows);
      if(updated_user.affectedRows !== 1){
        return res.status(404).json(
         {
          status:false,
          message:"No record updated"
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


}

export default Register