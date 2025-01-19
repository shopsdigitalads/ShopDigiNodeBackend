import pool from "../../../Database/Database.mjs"

class Clinet{
    static fetchClientByEmpId = async(req,res)=>{
        try {
            const {emp_id} = req.params

            if(!emp_id){
                return res.status(400).json({
                    status:false,
                    message:"Data Missing"
                })
            }

            const [clients] = await pool.query(`
                SELECT first_name,middle_name,last_name,mobile,email,status,remark where emp_id = ?`,[emp_id])

            console.log(Clinet)

            return res.status(200).json({
                status:true,
                clients:clients,
                message:"Client fetch successfully"
            })
        } catch (error) {
            return res.status(500).json({
                status:false,
                message:"An error occured"
            })
        }
    }
}