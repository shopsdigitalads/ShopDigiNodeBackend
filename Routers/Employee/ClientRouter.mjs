import express from 'express'
import Client from '../../Handlers/Employee/Client/Client.mjs'

const ClinetRouter = express.Router()


ClinetRouter.get("/clients/:emp_id",Client.fetchClientByEmpId)

export default ClinetRouter