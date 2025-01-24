import express from 'express'
import AuthHandler from '../../Handlers/Authentication/AuthHandler.mjs';

const AuthRouter = express.Router();


AuthRouter.post("/",AuthHandler.sendOTP);
AuthRouter.put("/",AuthHandler.verifyOTP);
AuthRouter.get("/display/:display_id",AuthHandler.displayLogin)
AuthRouter.put("/display",AuthHandler.verifyDisplayOTP)


export default AuthRouter;