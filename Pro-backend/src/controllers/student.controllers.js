import student from "../models/student.model.js";
import jwt from "jsonwebtoken";

let createToken = (id) => {
  return jwt.sign({ id }, "program007", {
    expiresIn: "7d",
  });
};

let signup = async (req, res, next) => {
  let { studentName, password, confirmPassword, email } = req.body;
  try {
    let existingStudent = await student.findOne({ email });
    if (existingStudent) {
      res
        .status(400)
        .json({ message: "User is already exists with this email" });
      return;
    }
    let newStudent=await student.create({
        studentName,
        password,
        confirmPassword,
        email
      })
      if(!newStudent){
         res.status(400).json({ message: "Trouble creating User" });
            return
      }
       let token=createToken(newStudent._id)

        res.status(200).json({newStudent,token})
  } catch (error) {
    console.log(error);

        res.status(500).json({
            message:error.message
        });
  }
};

let signin= async(req,res)=>{
    let {email,password}=req.body;

    try {

        let existingStudent=await student.findOne({email})

        if(!existingStudent){
            res.status(400).json({message:"Student doesn't exist.Please Signup!"})
            return
        }

        let isMatch=await existingStudent.comparePassword(password,existingStudent.password)

        if(!isMatch){
            res.status(400).json({message:"Password doesn't match" })
            return
        }
        let token=createToken(existingStudent._id)
        res.status(200).json({existingStudent,token})
        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message:error.message
        });
    }
}

export{
    signup,
    signin
}