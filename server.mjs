import cors from 'cors';  // Import the cors module
import dotenv from 'dotenv'; 
import os from 'os';
import express from 'express';
import RegistrationRoute from './Routers/Client/RegistratonRouter.mjs';
import DisplayRouter from './Routers/Client/DisplayRouter.mjs';
import AuthRouter from './Routers/Authentication/AuthRouter.mjs';
import Middleware from './Utils/MiddleWare.mjs';
import KYCRouter from './Routers/Client/KYCRouter.mjs';
import AddressRouter from './Routers/Client/AddressRouter.mjs';
import BusinessRouter from './Routers/Client/BusinessRouter.mjs';
import AdsRouter from './Routers/Client/AdsRouter.mjs';
import DisplayAdsRouter from './Routers/Display/AdvertisementRouter.mjs';
import ClinetRouter from './Routers/Employee/ClientRouter.mjs';
import DisplayEarningRouter from './Routers/Display/DisplayRouter.mjs';
import LeadsRouter from './Routers/Employee/LeadsRouter.mjs';


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    // origin: "http://localhost:3000",
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Logging Middleware
app.use(Middleware.logRouteAndType);
app.use(Middleware.authentiateRequest)
// app.use();

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.use("/auth",AuthRouter);
app.use("/client",RegistrationRoute);
app.use("/address",AddressRouter)
app.use("/kyc",KYCRouter)
app.use("/business",BusinessRouter)
app.use("/display",DisplayRouter);
app.use("/ads",AdsRouter)



app.use("/display/app",DisplayAdsRouter)
app.use("/display/earning",DisplayEarningRouter)

app.use("/employee",ClinetRouter)
app.use("/leads",LeadsRouter)

const PORT = 5000;

// Get all network interfaces
const getNetworkAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      // Filter only IPv4 and non-internal (not localhost) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  return addresses;
};

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at the following links:`);
  console.log(`- Local: http://localhost:${PORT}`);
  
  const addresses = getNetworkAddresses();
  addresses.forEach((addr) => {
    console.log(`- Network: http://${addr}:${PORT}`);
  });
});