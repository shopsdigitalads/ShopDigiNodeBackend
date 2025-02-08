import pool from '../../Database/Database.mjs'
import Utils from '../../Utils/utils.mjs'

class AuthHandler {
    static sendOTP = async (req, res) => {
        try {
            const { receive, val } = req.body;
            console.log("Incoming Request:", receive, val);

            if (!receive || !val) {
                return res.status(404).json({
                    status: false,
                    message: "Data not found"
                });
            }

            const otp = Utils.generateOtp();
            console.log("Generated OTP:", otp);

            // Send OTP
            const otp_status = await Utils.sendOtp(receive, val, otp);
            if (otp_status) {
                const hash_otp = await Utils.hashMessage(otp);

                // Calculate expiration time (e.g., 5 minutes from now)
                const expire_time = new Date(Date.now() + 5 * 60 * 1000);

                // Check if the record already exists
                const [existing_rows] = await pool.query(
                    "SELECT * FROM OtpVerification WHERE mobile_no_or_email = ?",
                    [receive]
                );

                if (existing_rows.length > 0) {
                    // Update the existing record
                    await pool.query(
                        "UPDATE OtpVerification SET otp = ?, expire_time = ?, verified = false WHERE mobile_no_or_email = ?",
                        [hash_otp, expire_time, receive]
                    );
                    console.log("Updated existing OTP entry for:", receive);
                } else {
                    // Insert a new record
                    await pool.query(
                        "INSERT INTO OtpVerification (mobile_no_or_email, otp, expire_time) VALUES (?, ?, ?)",
                        [receive, hash_otp, expire_time]
                    );
                    console.log("Inserted new OTP entry for:", receive);
                }

                return res.status(200).json({
                    status: true,
                    message: "OTP sent successfully",
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Failed to send OTP"
                });
            }
        } catch (e) {
            console.error("Error in sendOTP:", e);
            res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
    };

    static verifyOTP = async (req, res) => {
        try {
            const { receive, otp } = req.body;

            if (!receive || !otp) {
                return res.status(400).json({
                    status: false,
                    message: "Required data missing"
                });
            }

            // Fetch OTP details from the database
            const [rows] = await pool.query(
                "SELECT otp, expire_time FROM OtpVerification WHERE mobile_no_or_email = ?",
                [receive]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "No OTP found for the provided receiver"
                });
            }

            const { otp: stored_otp, expire_time } = rows[0];

            // Check if OTP has expired
            if (new Date() > new Date(expire_time)) {
                return res.status(400).json({
                    status: false,
                    message: "OTP has expired"
                });
            }

            // Verify the OTP
            const is_match = await Utils.verifyMessage(otp, stored_otp);
            if (!is_match) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid OTP"
                });
            }

            // Mark the OTP as verified
            await pool.query(
                "UPDATE OtpVerification SET verified = true WHERE mobile_no_or_email = ?",
                [receive]
            );

            // Check if user exists in the Users table
            const [user] = await pool.query(
                "SELECT * FROM Users WHERE mobile = ? OR email = ?",
                [receive, receive]
            );

            let user_exists = user.length > 0;
            let token;
            let ads_count = 0;
            let user_count = 0;
            let is_active = false;

            if (user_exists) {
                const payload = {
                    role: user[0].role,
                    mobile: receive
                };

                if (user[0].role === "Employee") {
                    payload.emp_id = user[0].user_id;

                    is_active = user[0].status === "Active"?true:false;
                    if(is_active){
                        const [adsCountResult] = await pool.query(
                            `SELECT COUNT(*) as ads_count FROM Advertisement WHERE emp_id = ?`,
                            [user[0].user_id]
                        );
                        const [userCountResult] = await pool.query(
                            `SELECT COUNT(*) as user_count FROM Users WHERE emp_id = ?`,
                            [user[0].user_id]
                        );
    
                        ads_count = adsCountResult[0].ads_count;
                        user_count = userCountResult[0].user_count;
                    }
                    
                } else {
                    payload.user_id = user[0].user_id;
                }

                token = Utils.generateToken(payload);
            } else {
                token = Utils.generateToken({
                    new_user: true,
                    allowd_route: "/client",
                    type: "POST"
                });
            }

            return res.status(200).json({
                status: true,
                message: "OTP verified successfully",
                user_exists,
                user: user_exists ? user[0] : null,
                is_active:is_active,
                ads_count,
                user_count,
                token
            });
        } catch (error) {
            console.error("Error in verifyOTP:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
    };


    static displayLogin = async (req, res) => {
        try {
            const { display_id } = req.params;
            if (!display_id) {
                console.log("here")
                return res.status(400).json({
                    status: false,
                    message: "Display ID Missing"
                })
            }

            const [mobile_no] = await pool.query(
                `   select 
                    u.mobile
                    from Users as u
                    join ClientBusiness as b
                    on b.user_id = u.user_id
                    join Display as d
                    on b.client_business_id = d.client_business_id
                    where d.display_id = ? and d.display_status = "Active" ;
                `, [display_id]
            )
            if (mobile_no.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid Display ID"
                })
            }
            console.log(mobile_no[0].mobile)

            const otp = Utils.generateOtp();
            console.log("Generated OTP:", otp);

            // Send OTP
            const otp_status = await Utils.sendOtp(mobile_no[0].mobile, "Mobile", otp);

            if (otp_status) {
                const hash_otp = await Utils.hashMessage(otp);


                const expire_time = new Date(Date.now() + 5 * 60 * 1000);

                // Check if the record already exists
                const [existing_rows] = await pool.query(
                    "SELECT * FROM OtpVerification WHERE mobile_no_or_email = ?",
                    [display_id]
                );

                if (existing_rows.length > 0) {
                    // Update the existing record
                    await pool.query(
                        "UPDATE OtpVerification SET otp = ?, expire_time = ?, verified = false WHERE mobile_no_or_email = ?",
                        [hash_otp, expire_time, display_id]
                    );
                    console.log("Updated existing OTP entry for:", display_id);
                } else {
                    // Insert a new record
                    await pool.query(
                        "INSERT INTO OtpVerification (mobile_no_or_email, otp, expire_time) VALUES (?, ?, ?)",
                        [display_id, hash_otp, expire_time]
                    );
                    console.log("Inserted new OTP entry for:", display_id);
                }

                return res.status(200).json({
                    status: true,
                    message: "OTP sent successfully",
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Failed to send OTP"
                });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: "Done"
            })
        }
    }

    static verifyDisplayOTP = async (req, res) => {
        try {
            const { receive, otp } = req.body;

            if (!receive || !otp) {
                return res.status(400).json({
                    status: false,
                    message: "Required data missing"
                });
            }

            // Fetch OTP details from the database
            const [rows] = await pool.query(
                "SELECT otp, expire_time FROM OtpVerification WHERE mobile_no_or_email = ?",
                [receive]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "No OTP found for the provided receiver"
                });
            }

            const { otp: stored_otp, expire_time } = rows[0];

            // Check if OTP has expired
            if (new Date() > new Date(expire_time)) {
                return res.status(400).json({
                    status: false,
                    message: "OTP has expired"
                });
            }

            // Verify the OTP
            const is_match = await Utils.verifyMessage(otp, stored_otp);
            if (!is_match) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid OTP"
                });
            }

            // Mark the OTP as verified
            await pool.query(
                "UPDATE OtpVerification SET verified = true WHERE mobile_no_or_email = ?",
                [receive]
            );

            let token = Utils.generateToken({
                display_id: receive
            });
            console.log(token)

            return res.status(200).json({
                status: true,
                message: "OTP verified successfully",
                token: token
            });
        } catch (error) {
            console.error("Error in verifyOTP:", error);
            res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
    };
}

export default AuthHandler;