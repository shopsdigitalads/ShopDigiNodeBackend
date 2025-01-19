import express from 'express'
import AuthHandler from '../../Handlers/Authentication/AuthHandler.mjs';

const AuthRouter = express.Router();


AuthRouter.post("/",AuthHandler.sendOTP);
AuthRouter.put("/",AuthHandler.verifyOTP);


export default AuthRouter;