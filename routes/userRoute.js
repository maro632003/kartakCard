const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");


const {uploadImage,reasizeImage,createUser,getSpecificUser,getAllUser,deleteUse,updateUser, profilePhotoChange}=require("../services/userService")

// const {createUserValidator,getUserValidator,deleteUserValidator,updateUserValidator}=require("../utils/dummy/validator/userValidator");
const userModel = require("../model/userModel");
// const { protect } = require("../services/authService");
const appError = require("../utils/dummy/apiError");

const protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new appError("you are not logged in", 500));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.userId);
    const currentUser = user;
  
    if (!user) {
      return next(new appError("user is no longer exist "));
    }
  
    req.currentUser = currentUser;
    next();
  });
  


// router.route("/").post(uploadImage,reasizeImage,createUser)
// .get(getAllUser)
// router.route("/:id").get(getUserValidator,getSpecificUser)
// .delete(deleteUserValidator,deleteUse)
// .put(updateUserValidator,uploadImage,reasizeImage,updateUser)
// router
//   .route("/profilePhotoChange")
//   .post(protect, uploadImage, reasizeImage, profilePhotoChange);

// module.exports=router;

router.route("/createUser").post(uploadImage, reasizeImage, createUser);
// .get(getAllUser);
router
  .route("/:id")
  .get(getSpecificUser)
  .delete(deleteUse)
  .put(uploadImage, reasizeImage, updateUser);
router
  .route("/profilePhotoChange")
  .post(protect, uploadImage, reasizeImage, profilePhotoChange);
module.exports = router;


