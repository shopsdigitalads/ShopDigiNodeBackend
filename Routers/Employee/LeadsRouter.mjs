import express from 'express'
import Leads from '../../Handlers/Employee/Leads/Leads.mjs'

const LeadsRouter = express.Router()


LeadsRouter.post("/",Leads.createLead)
LeadsRouter.get("/",Leads.fetchSortedLeads)

export default LeadsRouter