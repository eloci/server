import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: [true, "This email already exist"],
    validator: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minLength: [6, "Password must be at list 6 carracters long"],
    select: false,
  },
  address: {
    type: String,
    required: [true, "Please enter address"],
  },
  city: {
    type: String,
    required: [true, "Please enter city"],
  },
  country: {
    type: String,
    required: [true, "Please enter conutry"],
  },
  pinCode: {
    type: Number,
    required: [true, "Please enter Pin"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
});
//hashing the password before seving
schema.pre("save", async function (next) {
  //console.log(this.password)
  if(!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10);
});
//create a schema for method to be used by controller for hashed password
schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
export const User = mongoose.model("User", schema);
