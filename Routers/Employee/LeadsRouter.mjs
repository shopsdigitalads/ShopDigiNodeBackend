import express from 'express'
import Leads from '../../Handlers/Employee/Leads/Leads.mjs'


import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


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


const LeadsRouter = express.Router()


LeadsRouter.post("/", upload.single('visiting_card'),Leads.createLead)
LeadsRouter.get("/",Leads.fetchSortedLeads)

export default LeadsRouter