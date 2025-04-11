import express from 'express'
import multer from 'multer'
import path from 'path'
import {fileURLToPath} from 'url'
import KYC from '../../Handlers/Client/KYC/KYC.mjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '../../Media/Client'));
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext);
            const uniqueName = `${baseName}-${Date.now()}${ext}`;
            cb(null, uniqueName);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});


const KYCRouter = express.Router();

KYCRouter.post('/',
    upload.fields([
        {name:'adhar_front_img',maxCount:1},
        {name:"adhar_back_img",maxCount:1},
        {name:"pan_img",maxCount:1},
        {name:"bank_proof_img",maxCount:1},
        {name:"profile",maxCount:1}
    ]),KYC.applyForKYC
)

KYCRouter.put('/',
    upload.fields([
        {name:'adhar_front_img',maxCount:1},
        {name:"adhar_back_img",maxCount:1},
        {name:"pan_img",maxCount:1},
        {name:"bank_proof_img",maxCount:1},
        {name:"profile",maxCount:1}
    ]),KYC.updateKYC
)

KYCRouter.get("/:user_id",KYC.getKycOfUser)
KYCRouter.put("/update_request",KYC.updateRequest)
export default KYCRouter