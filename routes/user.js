import express from "express";
import { changePassword, forgetpassword, getMyProfile, login, logOut, resetpassword, signup, updatePic, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

//Creating first route
const router = express.Router();

router.post("/login", login);
router.post("/new",singleUpload, signup);
router.get("/me",isAuthenticated, getMyProfile);
router.get("/logout",isAuthenticated, logOut);

//updateing Routes
router.put("/updateprofile",isAuthenticated,updateProfile)
router.put("/changepassword",isAuthenticated,changePassword)
router.put("/updatepic",isAuthenticated,singleUpload,updatePic)

//forget password & reset password
router.route("/forgetpassword").post(forgetpassword).put(resetpassword)

export default router;
