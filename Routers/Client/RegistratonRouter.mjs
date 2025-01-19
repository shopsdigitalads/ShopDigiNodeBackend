import express from 'express';
import Register from '../../Handlers/Client/Registration/Registration.mjs';


const RegistrationRoute = express.Router();

RegistrationRoute.post(
  '/',
  Register.register
);

RegistrationRoute.put("/",Register.update)
export default RegistrationRoute;
