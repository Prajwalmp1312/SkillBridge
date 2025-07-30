import admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";

let createToken = () => {
  return jwt.sign({ id }, "rcb18", {
    expiresIn: "14d",
  });
};

let signup = async (req, res, next) => {
  let { Name, email, password, confirmPassword } = req.body;
  try {
    let existingUser = await admin.findOne({ Name });

    if (existingUser) {
      res.status(400).json({ message: "User already exists.Please Login!" });
      return;
    }
  
    let token = createToken(existingUser._id);

    res.status(200).json({ existingUser, token });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

let signin = async (req, res, next) => {
  let { Name, password } = req.body;
  try {
    let existingUser = await admin.findOne({ Name });

    if (!existingUser) {
      res
        .status(400)
        .json({ message: "User is not register, please login as admin" });
      return;
    }
    let isMatch = await existingUser.comparePassword(
      password,
      existingUser.password
    );

    if (!isMatch) {
      res.status(400).json({ message: "Password doesn't match" });
      return;
    }

    let token = createToken(existingUser._id);
    res.status(200).json(existingUser, token);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export { signup, signin };
