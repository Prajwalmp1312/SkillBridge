import express from 'express'
import { signup,signin } from '../controllers/admin.controllers.js'



let router=express.Router()


//signup
router.post("/signup",signup)
router.post("/signin",signin)


export default router