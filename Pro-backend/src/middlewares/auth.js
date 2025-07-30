import jwt from 'jsonwebtoken'
import Tutor from '../models/tutor.model.js';


export let auth=async (req,res,next)=>{
    
    let token=req.headers?.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).send("Please Login")
    }
    
    let decodedToken=jwt.verify(token,"tutorSecret")
    
    let tutor=await Tutor.findById(decodedToken.id)
    if(!tutor){
        return res.status(401).send("There is no such tutor please register")
    }
    
    req.tutorId=tutor._id
    next()
}