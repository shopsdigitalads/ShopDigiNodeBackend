import express from 'express'
import Display from '../../Handlers/Display/Display/Display.mjs'

const DisplayEarningRouter = express.Router()

DisplayEarningRouter.post("/",Display.displayEarning)


export default DisplayEarningRouter;