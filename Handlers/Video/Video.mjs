import pool from "../../Database/Database.mjs";
import VideoCompress from "../../Utils/VideoCompress.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// ✅ Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Video {
    static videoCompress = async (req, res) => {
        try {
            const { ads_id } = req.params;

            // ✅ Validate input
            if (!ads_id) {
                return res.status(400).json({
                    status: false,
                    message: "Ads ID Missing",
                });
            }

            // ✅ Fetch video path from DB
            const [rows] = await pool.query(
                "SELECT ad_path FROM Advertisement WHERE ads_id = ?",
                [ads_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Advertisement not found" });
            }

            // ✅ Construct paths

            const filePath = path.resolve(__dirname, "../../../", rows[0].ad_path);  // Resolve to get the absolute path

            const fileExtension = path.extname(filePath);
            const directoryPath = path.dirname(filePath);
            const new_path = path.join(directoryPath, `ads_${ads_id}${fileExtension}`);

            // Define the base directory (the root directory of your project or media folder)
            const baseDirectory = path.resolve(__dirname, "../../../");  // Adjust this if your base is different

            // Calculate the relative path from the base directory to the new path
            const relativePath = path.relative(baseDirectory, new_path);

            // Ensure the output directory exists
            const outputDir = path.dirname(new_path);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            console.log(`Old file path : ${filePath}`);
            console.log(`directoryPath : ${directoryPath}`);
            console.log("🔹 New Path:", relativePath);

            try {
                await pool.query(`UPDATE Advertisement SET is_optimize = "Optimizing" WHERE ads_id = ?`, [ads_id]);
                VideoCompress.compressVideo(filePath, new_path,relativePath,ads_id, 50);                
                console.log("✅ Video compressed successfully!");
                return res.status(201).json({
                    status: true,
                    message: "Ad optimized successfully",
                });
            } catch (error) {
                console.error("❌ Compression failed:", error);
                return res.status(500).json({
                    status: false,
                    message: "Error optimizing ad",
                });
            }
        } catch (error) {
            console.error("❌ Server Error:", error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
            });
        }
    };
}

export default Video;
