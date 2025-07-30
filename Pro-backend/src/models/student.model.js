import mongoose from "mongoose";
import bcrypt from "bcryptjs";

let studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    minLength: [3, "Username should not be less than 3 characters"],
    trim: true,
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
    required: true,
    validate: {
      validator: function (value) {
        return String(value).match(/^[a-zA-Z0-9!@#\$%\^&*\_=+-]{8,12}$/g);
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
studentSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next()
});

studentSchema.methods.comparePassword = async function (pwd, pwdDb) {
  return await bcrypt.compare(pwd, pwdDb);
};

let student = mongoose.model("student", studentSchema);

export default student;
