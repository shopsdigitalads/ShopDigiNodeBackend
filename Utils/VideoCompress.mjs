import ffmpeg from "fluent-ffmpeg";
import fs from "fs"
import util from "util";
import pool from "../Database/Database.mjs"

class VideoCompress {
  static ffprobeAsync = util.promisify(ffmpeg.ffprobe);

  static async getVideoDuration(inputPath) {
    try {
      const metadata = await VideoCompress.ffprobeAsync(inputPath);
      return metadata.format.duration; // Get video duration in seconds
    } catch (error) {
      console.error("Error getting video metadata:", error);
      throw error;
    }
  }

  static async compressVideo(inputPath, outputPath,relativePath,ads_id, targetSizeMB = 50) {
    try {
      // Get video duration
      const durationInSeconds = await VideoCompress.getVideoDuration(inputPath);

      // Calculate target bitrate
      const targetSizeBits = targetSizeMB * 8 * 1024 * 1024; // Convert MB to bits
      const targetBitrate = (targetSizeBits / durationInSeconds).toFixed(0); // Calculate bitrate in bits per second

      console.log(`🎥 Video Duration: ${durationInSeconds}s`);
      console.log(`🎯 Target Bitrate: ${targetBitrate} bps`);

      await VideoCompress.runFFmpeg(inputPath, outputPath, targetBitrate);

      await pool.query(`UPDATE Advertisement SET ad_path = ?, is_optimize = "Optimized" WHERE ads_id = ?`, [relativePath, ads_id]);

      fs.unlink(inputPath, (err) => {
        if (err) {
            console.error("❌ Failed to delete original file:", err);
        } else {
            console.log("✅ Original file deleted successfully!");
        }
    });
      console.log("✅ Compression Completed!");
    } catch (error) {
      console.error("❌ Error in compression:", error);
      throw new Error("Compression failed.");
    }
  }

  static async runFFmpeg(inputPath, outputPath, targetBitrate) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          `-b:v ${targetBitrate}`, // Set calculated bitrate
          "-preset fast", // Faster compression
          "-movflags +faststart", // Optimize for web streaming
        ])
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  }
}

export default VideoCompress;
