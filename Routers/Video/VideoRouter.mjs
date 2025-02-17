import express from "express";
import Video from "../../Handlers/Video/Video.mjs";

const VideoRouter = express.Router()

VideoRouter.get("/:ads_id",Video.videoCompress)

export default VideoRouter