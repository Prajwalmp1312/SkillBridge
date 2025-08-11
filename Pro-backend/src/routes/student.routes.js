import express from 'express'
import { signin,signup } from '../controllers/student.controllers.js'




let router=express.Router()


//signup
router.post("/signup/student",signup)
router.post("/signin/student",signin)


export default router