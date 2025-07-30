import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";

let adminSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    minlength: [3, "Name should be not less than 3 characters"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
    validate: {
      validator: function (value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
      },
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
  password: {
    type: String,
    required: [true, "Paasword is required"],
    validate: {
      validator: function (value) {
        return password(value).match(/^[a-zA-Z0-9!@#\$%\^&*\_=+-]{8,12}$/g);
      },
      message: `Password should have At least 1 Uppercase, At least 1 Lowercase,  At least 1 Number,At least 1 Symbol, symbol allowed --> !@#$%^&*_=+- , Min 8 chars and Max 12 chars`,
    },
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirmpassword is required field"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password and Confirm password doesnt match",
    },
  },
});

adminSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
});

adminSchema.methods.comparePassword = async function (pwd, pwdDb) {
  return await bcrypt.compare(pwd, pwdDb);
};

let admin=mongoose.model("Admin",adminSchema)

export default admin;
