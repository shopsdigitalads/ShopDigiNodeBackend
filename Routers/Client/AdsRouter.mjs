import express from 'express'
import Ads from '../../Handlers/Client/Ads/Ads.mjs';

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '../../Media/Client'));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  // fileFilter(req, file, cb) {
  //   console.log(file.mimetype)
  //   if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //   }
  // },
});


const AdsRouter = express.Router();

AdsRouter.post("/create",Ads.createAdd)
AdsRouter.post("/upload",
    upload.single('ad_file'),
    Ads.upload)
AdsRouter.post("/location",Ads.addAdsLocation)
AdsRouter.post("/display",Ads.addAdDisplay)
AdsRouter.get("/:user_id",Ads.getAdsOfUser)
AdsRouter.get("/details/:ad_id",Ads.getAdDetails);
AdsRouter.post("/ad_display",Ads.fetchAdsDisplay)
export default AdsRouter;
