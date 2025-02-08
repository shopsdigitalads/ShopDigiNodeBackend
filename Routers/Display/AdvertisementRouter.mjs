import express from 'express'
import AdvertisementDisplay from '../../Handlers/Display/Advertisement/Advertisement.mjs'

const DisplayAdsRouter = express.Router()

DisplayAdsRouter.post("/ads",AdvertisementDisplay.fetchAdsForDisplay)

DisplayAdsRouter.get("/ads/:ads_id",AdvertisementDisplay.downloadAds)


export default DisplayAdsRouter