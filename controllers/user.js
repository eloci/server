import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandtler from "../utils/error.js";
import {
  cookieOptions,
  getDataUri,
  sendEmail,
  sendToken,
} from "../utils/features.js";
import cloudinary from "cloudinary";

//First route creation Login
export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandtler("Incorrect email or Password", 400));
  }
  if (!password) return next(new ErrorHandtler("Please Enter Password", 400));
  //handlle error
  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    return next(new ErrorHandtler("Incorrect email or Password", 400));
  }
  sendToken(user, res, `Welcome back, ${user.name}`, 200);
});
export const signup = asyncError(async (req, res, next) => {
  //destructure the model
  const { name, email, password, address, city, country, pinCode } = req.body;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandtler("User Already Exist", 400));
  //adding cloudinary here to upload user avatar

  let avatar = undefined;
  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  //create the object on mongo
  user = await User.create({
    avatar,
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });
  //result will be status 201 it means succ created
  sendToken(user, res, `Registered Succesfully`, 201);
});
//logOut
export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Succefully",
    });
});
//My Profile
export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});
//Update Profile
export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Updated Succesfully",
  });
});
//Update Password
export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(
      new ErrorHandtler("Please Enter Old Password & New Password", 400)
    );
  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) return next(new ErrorHandtler("Incorrect Old Password", 400));
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Changed Succesfully",
  });
});
//Pictures
export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated succesfully",
  });
});

//Forget Password
export const forgetpassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandtler("Incorrect Email", 404));
  //max,min number will be originated like 2000,10000
  //the formulla will be math.random()*(max-min)+min
  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();
  //console.log(otp);

  //sendEmail()
  const message = `Your OTP for reseting password is ${otp} .\n Please ignore if you havent requested this`;
  try {
    await sendEmail("OTP for reseting password", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: `Email Sent To ${user.email}`,
  });
});
//reset password
export const resetpassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;
  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandtler("Inccorect OTP or has been expired", 400));
    if (!password) return next(new ErrorHandtler("Please enter new password",400))
  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save()

  res.status(200).json({
    success: true,
    message:"Password changed Succefully, You can login now",
  });
});
