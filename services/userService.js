const { default: slugify } = require("slugify");
const appError = require("../utils/dummy/apiError");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middleware/uploadImage");
const { v4: uuidv4 } = require("uuid");
const { now } = require("mongoose");
const sharp = require("sharp");
const userModel = require("../model/userModel");
const { use } = require("../routes/userRoute");
const jwt = require("jsonwebtoken");
const createToken = require("../utils/dummy/jwtFunction");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/dummy/cloudinary");
const path = require("path");
const fs = require("fs");
// const userModel = require("../model/userModel");
const uploadImage=uploadSingleImage("profileImage")
const reasizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    try {
      // check if file is created
      // if not create it
      const dir = "uploads/user";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await sharp(req.file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${dir}/${fileName}`);
    } catch (err) {
      res.json(err);
    }
  }
  req.body.profileImage = fileName;
  next();
});
// const reasizeImage = asyncHandler(async (req, res, next) => {
//     const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

//     if (req.file) {
//         const uploadPath = path.join(__dirname, 'uploads', 'user');

//         // Ensure the directory exists
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }

//         try {
//             await sharp(req.file.buffer)
//                 .toFormat('jpeg')
//                 .jpeg({ quality: 90 })
//                 .toFile(path.join(uploadPath, fileName));
//         } catch (err) {
//             return res.status(500).json({ message: err.message });
//         }
//     }

//     req.body.profileImage = fileName;
//     next();
// });
const createUser = asyncHandler(async (req, res, next) => {
    req.body.slug = slugify(req.body.name);
    const oldUser = await userModel.findOne({ name: req.body.name });
  
    if (oldUser) {
      const error = new appError("user already exists !!", 400, "FAILED");
      return next(error);
    }
    // validation if admin uploud image
    if (!req.file) {
      return res.status(400).json({ message: "no file provided" });
    }
    //2.get the path to the image
    const imagePath = path.join(
      __dirname,
      `../uploads/user/${req.body.profileImage}`
    );
    console.log("image path :>> ", imagePath);
    //3.upload ro cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    // console.log("the result",result);
    //create object of new place to update (url,publicId)
    const newUser = new userModel(req.body);
  
    //update (url,publicId)
    newUser.cloudImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    const user = await userModel.create(newUser);
    if (!user) {
        res
        .status(400)
        .json({ status: "faild", message: "faild to create an user" });
    }
    await user.save();
    const token = createToken(user._id);
  
    res.status(200).json({ status: "success", Data: user, token });
    // res.status(200).json({ status: "success", Data: user, token: token });
    fs.unlinkSync(imagePath)
  });
const getSpecificUser=asyncHandler(async(req,res,next)=>{
    const id=req.params.id;
    const user = await userModel.findById(id)
    if(!user){
        res.status(400).json(`not user in this id ${id}`)
    }
    res.status(200).json({status:"success",data:user})
})

const getAllUser=asyncHandler(async(req,res,next)=>{
    const user =await userModel.find()
    if(!user){
        res.status(400).json(`no user`)
    }
    res.status(200).json({length:user.length,status:"success",data:user})

})
const deleteUse=asyncHandler(async(req,res,next)=>{
    const id=req.params.id
    const user=await userModel.findByIdAndDelete(id)
    if(!user){
        res.status(500).json(`not found user in this id${user}`)
    }
    res.status(200).json({status:"success",message:"user is deleted"})
})

const updateUser=asyncHandler(async(req,res,next)=>{
    const id=req.params.id
    if(req.body.name){
        req.body.slug=slugify(req.body.name)
    }
    
    const user=await userModel.findByIdAndUpdate(id,req.body,{new:true})
    if(!user){
        res.status(500).json(`not user for this id ${id}`)

    }
    res.status(500).json({status:"success",data:user})


})
// const profilePhotoChange = asyncHandler(async (req, res) => {
//     //1.valedation
//     if (!req.file) {
//       return res.status(400).json({ message: "no file provided" });
//     }
//     console.log("req.file===>", req.file);
//     //2.get the path of image
//     const imagePath = path.join(
//       __dirname,
//       `../uploads/user/${req.body.profileImage}`
//     );
//     console.log("imagePath",imagePath);
//     //3.upload to cloudinary
//     const result = await cloudinaryUploadImage(imagePath);
//     // console.log("result",result)
  
//     //4. get hte user from DB
//     const userlogged = await userModel.findById(req.currentUser._id);
//     //  console.log("current user",userlogged);
//     //5.delete the old profile photo if it exists
//     if (userlogged.cloudImage.publicId !== null) {
//       await cloudinaryRemoveImage(userlogged.cloudImage.publicId);
//     }
//     // console.log("before profile photo",userlogged.cloudImage)
//     //6.change the profile photo
//     userlogged.cloudImage = {
//       url: result.secure_url,
//       publicId: result.public_id,
//     };
//     // console.log("after profile photo",userlogged.cloudImage)
  
//     await userlogged.save();
//     //7.send response to client
//     res
//       .status(200)
//       .json({
//         message: "your profile photo updated successfully",
//         profilePhotoLink: { url: userlogged.cloudImage.url },
//       });
//     //8.Remove the photo from the server
//     fs.unlinkSync(imagePath);
//   });

const profilePhotoChange = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.currentUser._id);
  //1.valedation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }
  console.log("req.file===>", req.file);
  //2.get the path of image
  const imagePath = path.join(
    __dirname,
    `../uploads/user/${req.body.profileImage}`
  );
  // console.log("imagePath",imagePath);
  //3.upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);
  // console.log("result",result)

  //4. get hte user from DB
  const userlogged = await userModel.findById(req.currentUser._id);
  //  console.log("current user",userlogged);
  //5.delete the old profile photo if it exists
  if (userlogged.cloudImage.publicId !== null) {
    await cloudinaryRemoveImage(userlogged.cloudImage.publicId);
  }
  // console.log("before profile photo",userlogged.cloudImage)
  //6.change the profile photo
  userlogged.cloudImage = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  // console.log("after profile photo",userlogged.cloudImage)

  await userlogged.save();
  //7.send response to client
  res
    .status(200)
    .json({
      message: "your profile photo updated successfully",
      user:user,
      profilePhotoLink: { url: userlogged.cloudImage.url },

    });
  //8.Remove the photo from the server
  fs.unlinkSync(imagePath);
});

module.exports={
    uploadImage,
    reasizeImage,
    createUser,
    getSpecificUser,
    getAllUser,
    deleteUse,
    updateUser,
    profilePhotoChange

}