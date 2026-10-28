import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let tutorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, 'name min characters are 4'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is mandatory'],
      unique: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'password is required field'],
      validate: {
        validator: function (value) {
          return String(value).match(/^[a-zA-Z0-9!@#\$%\^\&*_=+-]{8,12}$/g);
        },
        message:
          'Password should have At least 1 Uppercase, At least 1 Lowercase,  At least 1 Number,At least 1 Symbol, symbol allowed --> !@#$%^&*_=+- , Min 8 chars and Max 12 chars',
      },
    },
    confirmPassword: {
      type: String,
      required: [true, 'password is required field'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Password and Confirm password doesnt match',
      },
    },
    expertise: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    qualifications: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

tutorSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

tutorSchema.methods.comparePassword = async function (pwd, pwdDB) {
  return await bcrypt.compare(pwd, pwdDB);
};

let Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;
