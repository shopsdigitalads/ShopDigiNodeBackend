import express from "express"
import AdminAds from "../../Handlers/Client/Admin/AdminAds.mjs"

const AdminRouter = express.Router()

AdminRouter.get("/ads",AdminAds.getAdminAds)

export default AdminRouter