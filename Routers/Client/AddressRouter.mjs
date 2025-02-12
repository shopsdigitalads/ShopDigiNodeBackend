import express from 'express'
import Address from '../../Handlers/Client/Address/Address.mjs';

const AddressRouter = express.Router()

AddressRouter.post("/",Address.addAddress);
AddressRouter.put("/",Address.updateAddress);
AddressRouter.get("/ads/:business_type_id",Address.getAddressForAds)
AddressRouter.get("/:user_id",Address.getAddressOfUser)
AddressRouter.put("/update_request",Address.updateRequest)
export default  AddressRouter;