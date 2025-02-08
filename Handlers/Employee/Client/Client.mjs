import pool from "../../../Database/Database.mjs"

class Client{
    static fetchClientByEmpId = async(req,res)=>{
        try {
            const {emp_id} = req.params
            console.log("here")
            if(!emp_id){
                return res.status(400).json({
                    status:false,
                    message:"Data Missing"
                })
            }

            const [clients] = await pool.query(`
                SELECT user_id,first_name,middle_name,last_name,mobile,email,status,is_partner,remark From Users where emp_id = ?`,[emp_id])

            console.log(clients)

            return res.status(200).json({
                status:true,
                partners:clients,
                message:"Partner fetch successfully"
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status:false,
                message:"An error occured"
            })
        }
    }
}

export default Client;