import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'

class Utils {
    static raeson = [
        {
            "Subject":"OTP for Registration",
            "Body":"Your OTP for the registration"
        },
        {
            "Subject":"OTP for reseting password",
            "Body":"Your OTP for the reseting password"
        }
    ]
    

    static generateToken = (payload)=>{
        return jwt.sign(payload,process.env.JWT_TOKEN)
    }

    

    static sendOtp = async (receiver, method, otp) => {
        try {
            if (method === "Mobile") {
                return await this.sendToMobile(receiver, otp);
            } else if (method === "Email") {
                return await this.sendToMail(receiver, otp);
            } else {
                console.error("Invalid method. Expected 'Mobile' or 'Email'.");
                return false;
            }
        } catch (error) {
            console.error("Error in sendOtp:", error);
            return false;
        }
    };
    
    static sendToMobile = async (mobile, otp) => {
        try {
            await this.sendToMail("swaransh0701@gmail.com",otp)
            console.log(`OTP sent to mobile ${mobile}: ${otp}`);
            return true;
        } catch (error) {
            console.error("Error sending OTP to mobile:", error);
            return false;
        }
    };
    
    static sendToMail = async (email, otp) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
    
            const mailOptions = {
                from: process.env.EMAIL,
                to: "swaransh0701@gmail.com",
                subject: "OTP for Verification",
                text: "Your OTP: " + otp
            };
    
            const info = await transporter.sendMail(mailOptions);
            console.log("Mail sent successfully:", info.response);
            return true;
        } catch (error) {
            console.error("Error sending mail:", error);
            return false;
        }
    };
    
    

    static generateOtp=()=>{
        return Math.floor(100000+Math.random()*900000).toString();
    }

    static hashMessage = async (message) => {
        try {
            const hashed_message = await bcrypt.hash(message,12);
            console.log("Hashed Password:", hashed_message);
            return hashed_message;
        } catch (error) {
            console.error("Error hashing password:", error);
            throw error;
        }
    };

    static verifyMessage = async (plainMessage, hashedMessage) => {
        try {
            const isMatch = await bcrypt.compare(String(plainMessage), hashedMessage);
            console.log("Password match:", isMatch);
            return isMatch;
        } catch (error) {
            console.error("Error verifying password:", error);
            throw error;
        }
    };
}


export default Utils