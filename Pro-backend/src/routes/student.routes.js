import express from 'express'
import { signin,signup } from '../controllers/student.controllers.js'




let router=express.Router()


//signup
router.post("/signup",signup)
router.post("/signin",signin)


export default router