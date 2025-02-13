import express from 'express'
import Notification from '../../Handlers/Notification/Notification.mjs'

const NotificationRouter = express.Router()

NotificationRouter.post("/",Notification.sendPublishedAdsNotification)

export default NotificationRouter