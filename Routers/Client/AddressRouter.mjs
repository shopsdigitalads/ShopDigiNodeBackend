import express from 'express'
import Address from '../../Handlers/Client/Address/Address.mjs';

const AddressRouter = express.Router()

AddressRouter.post("/",Address.addAddress);
AddressRouter.put("/",Address.updateAddress);
AddressRouter.get("/ads/:business_type_id",Address.getAddressForAds)


export default  AddressRouter;