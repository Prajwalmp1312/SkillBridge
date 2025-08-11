import express from 'express'
import { signup,signin } from '../controllers/admin.controllers.js'



let router=express.Router()


//signup
router.post("/signup/admin",signup)
router.post("/signin/admin",signin)


export default router