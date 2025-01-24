import express from 'express'
import AdvertisementDisplay from '../../Handlers/Display/Advertisement/Advertisement.mjs'

const DisplayAdsRouter = express.Router()

DisplayAdsRouter.post("/",AdvertisementDisplay.fetchAdsForDisplay)


export default DisplayAdsRouter