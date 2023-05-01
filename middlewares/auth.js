import { User } from "../models/user.js";
import ErrorHandtler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  //const token = req.cookies.token
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandtler("Not Loged In", 401));
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodeData._id);

  next();
});
export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role!=="admin") return next(new ErrorHandtler("Only Admin Allowed", 401));
  next();
});
