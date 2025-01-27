import exp from 'constants';
import express from 'express'
import multer from 'multer'
import path from 'path'
import {fileURLToPath} from 'url'
import Business from '../../Handlers/Client/Business/Business.mjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const upload = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,path.resolve(__dirname,'../../Media/Client'));
        },
        filename:(req,file,cb)=>{
            cb(null,file.originalname);
        }
    }),
    fileFilter(req,file,cb){
        if(file.mimetype.startsWith('image/')){
            cb(null,true);
        }else{
            cb(null,false)
        }
    }
})

const BusinessRouter = express.Router();

BusinessRouter.post("/",
    upload.fields([
        {name:"interior_img",maxCount:1},
        {name:"exterior_img",maxCount:1},
    ]),
    Business.addBusiness
)

BusinessRouter.put("/",
    upload.fields([
        {name:"interior_img",maxCount:1},
        {name:"exterior_img",maxCount:1},
    ]),
    Business.updateBusiness
)

BusinessRouter.get("/types",Business.getBusinessTypes)
BusinessRouter.get("/:userId",Business.getBusinessOfUser)
export default BusinessRouter;