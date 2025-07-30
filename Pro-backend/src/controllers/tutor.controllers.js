import Tutor from "../models/tutor.model.js";
import jwt from "jsonwebtoken";

let createToken = (id) => {
  return jwt.sign({ id }, "tutorSecret", {
    expiresIn: "1d",
  });
};

let signup = async (req, res) => {
  let { tutorname, password, confirmPassword } = req.body;
  try {
    let existingTutor = await Tutor.findOne({ tutorname });
    if (existingTutor) {
      res.status(400).json({ message: "Tutor already exists.Please Login!" });
      return;
    }
    let newTutor = await Tutor.create({
      tutorname,
      password,
      confirmPassword
    });

    if (!newTutor) {
      res.status(400).json({ message: "Trouble creating Tutor" });
      return;
    }
    let token = createToken(newTutor._id);
    res.status(200).json({ newTutor, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

let signin = async (req, res) => {
  let { tutorname, password, confirmPassword } = req.body;
  try {
    let existingTutor = await Tutor.findOne({ tutorname });
    if (!existingTutor) {
      res
        .status(400)
        .json({ message: "Tutorname doesn't exist.Please Signup!" });
      return;
    }

    let isMatch = await existingTutor.comparePassword(
      password,
      existingTutor.password
    );
    if (!isMatch) {
      res.status(400).json({ message: "Password doesn't match" });
      return;
    }
    let token = createToken(existingTutor._id);
    res.status(200).json({ existingTutor, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export { signup, signin };


