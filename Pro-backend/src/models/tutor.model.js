import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

let tutorSchema = new mongoose.Schema({
  tutorname: {
    type: String,
    required: true,
    minLength: [4, "tutorname min characters are 4"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required field"],
    validate:{
      validator:function(value){
        return String(value).match(/^[a-zA-Z0-9!@#\$%\^\&*_=+-]{8,12}$/g)
      },
      message:"Password should have At least 1 Uppercase, At least 1 Lowercase,  At least 1 Number,At least 1 Symbol, symbol allowed --> !@#$%^&*_=+- , Min 8 chars and Max 12 chars"
    }
  },
  confirmPassword: {
    type: String,
    required: [true, "password is required field"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password and Confirm password doesnt match",
    },
  },
});


tutorSchema.pre("save",async function(next){
  this.password=await bcrypt.hash(this.password,10)
  this.confirmPassword=undefined;
  next()
})

tutorSchema.methods.comparePassword=async function(pwd,pwdDB){
  return await bcrypt.compare(pwd,pwdDB)
}

let Tutor = mongoose.model("Tutor", tutorSchema);

export default Tutor;

