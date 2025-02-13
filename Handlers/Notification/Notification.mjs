import pool from  "../../Database/Database.mjs"
import NotificationUtils from "../../Utils/Notification.mjs"

class Notification{
    static sendPublishedAdsNotification = async(req,res)=>{
        try {
            const [fcm_tokens] = await pool.query(`SELECT fcm_token from Display where display_status = 'Active' `,)
            const token = fcm_tokens.map((t)=>t.fcm_token)
            await NotificationUtils.sendNotificationToDisplay(token,"Download New Ads","0")

            return res.status(200).json({
                status:true,
                message:"Notification Sent Successfully"
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status:false,
                message:"Internal Server Error"
            })
        }
    }
}


export default Notification