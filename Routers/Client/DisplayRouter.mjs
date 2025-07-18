import express from 'express'
import Display from '../../Handlers/Client/Display/Display.mjs'
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

const DisplayRouter = express.Router();

DisplayRouter.post("/",
  upload.fields([
    { name: 'display_img', maxCount: 1 },
    { name: 'display_video', maxCount: 1 },
  ])

  , Display.addDisplay);


DisplayRouter.put("/",
  upload.fields([
    { name: 'display_img', maxCount: 1 },
    { name: 'display_video', maxCount: 1 },
  ])
  , Display.updateDisplay);

DisplayRouter.get("/types",Display.getDisplayTypes)
DisplayRouter.post("/ads",Display.getDisplayWithArea)
DisplayRouter.get("/history/:display_id/:date",Display.getDisplayHistory)

DisplayRouter.put("/update_request",Display.updateRequest)
DisplayRouter.get("/update_request/:user_id",Display.getDisplayUpdateRequest)
export default DisplayRouter;