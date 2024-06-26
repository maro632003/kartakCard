const express=require("express");
const router=express.Router();
const { login, resetPassword, updatePassword, protect, currentUser } = require("../services/authService")
const { forgetPassword , verifyResetCode} = require("../services/authService")

router.route("/").post(login)
router.route("/forgetPassword").post(forgetPassword)
router.route("/verifyResetCode").post(verifyResetCode)
router.route("/updatePassword").patch(protect,updatePassword)
router.route("/currentUser").get(protect,currentUser)

 module.exports=router;
