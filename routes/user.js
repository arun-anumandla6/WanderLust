const express=require('express');
const router=express.Router();
const User=require("../Models/User");
const wrapasync=require("./utils/wrapasync.js");
const passport=require("passport");
const{saveRedirectUrl}=require("../middleware.js");
const usercontroller=require("../controllers/user.js");

router.route("/signup")
.get(usercontroller.renderSignupForm)
.post(wrapasync(usercontroller.usersignup));

router.route("/login")
.get(usercontroller.renderLoginform)
.post(saveRedirectUrl,passport.authenticate(
    'local',{failureRedirect:'/login',failureFlash:true}),
    wrapasync(usercontroller.userLogin));

router.get("/logout", usercontroller.userLogout);

module.exports=router;
