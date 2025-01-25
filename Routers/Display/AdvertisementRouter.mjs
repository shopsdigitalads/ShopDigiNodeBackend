import express from 'express'
import AdvertisementDisplay from '../../Handlers/Display/Advertisement/Advertisement.mjs'

const DisplayAdsRouter = express.Router()

DisplayAdsRouter.post("/",AdvertisementDisplay.fetchAdsForDisplay)

DisplayAdsRouter.post("/status",AdvertisementDisplay.displayStatus)

export default DisplayAdsRouter