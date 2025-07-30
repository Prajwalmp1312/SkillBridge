import express from 'express';
import { signin, signup } from '../controllers/tutor.controllers.js';
// import { validate } from '../middlewares/validation.js';
// import signupSchema from '../schemas/tutor.schema.js';

let router=express.Router()


router.post("/signup", signup);


router.post("/signin",signin );

export default router

// validate(signupSchema),
