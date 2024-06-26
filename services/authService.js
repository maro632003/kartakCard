const asyncHandler = require("express-async-handler");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const appError = require("../utils/dummy/apiError");
const { use } = require("../routes/userRoute");
const jwt = require("jsonwebtoken");
// const createToken = require("../utils/dummy/jwtFunction");
const sendEmail = require("../utils/dummy/email");
const crypto = require("crypto");


const createToken=(payloud)=>{
    const token=jwt.sign({userId:payloud},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE_TIME
    })
    return token;
}
const login=asyncHandler(async(req,res,next)=>{
    const user =await userModel.findOne({email:req.body.email})
    if(!user || !(await bcrypt.compare(req.body.password,user.password) )){
        return next(new appError("email or password are not corrected",500))
    }
   
    token=createToken(user._id)
    res.status(200).json({ status: "success", Data: user, token: token });

})

const protect=asyncHandler(async(req,res,next)=>{
let token;

if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
  token=req.headers.authorization.split(" ")[1]
  
}
if(!token){
    return next(new appError("you are not logged in",500))
}
const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
const user=await userModel.findById(decoded.userId)
const currentUser=user

if(!user){
     return next(new appError("user is no longer exist "))

}

req.currentUser=currentUser;

next();

})

const forgetPassword=asyncHandler(async(req,res,next)=>{
  const user =await userModel.findOne({email: req.body.email})
 
  if(!user){
      return next (new appError(`this email not found ${req.body.email}`,404))

  }
  const resetCoder=Math.floor(Math.random() * 899999 + 100000).toString();


  const  hashCode =await crypto
  .createHash('md5')
  .update(resetCoder)
  .digest('hex');
   user.passwordResetCode=hashCode
   user.passwordResetExpires=Date.now() + 10 * 60 * 1000
   user.passwordResetVerified=false

   user.save();
   const message=`hi ${user.name} 
   you recieve resetcode
    ${resetCoder}`

    try{
      await sendEmail({email:user.email,
          subject:`your passwordReset valid to only 10m `,
          message:message
      })

    }
    catch(err){
      user.passwordResetCode=undefined
      user.passwordResetExpires=undefined
      user.passwordResetVerified=undefined
      user.save();
      return next(new appError("there is an error on sending an email"))
    }

  
  res.json({message:"you send an emil"})

})
const verifyResetCode=asyncHandler(async(req,res,next)=>{
  const  hashResetCode =await crypto
  .createHash('md5')
  .update(req.body.resetCode)
  .digest('hex');
  const user=await userModel.findOne({
      passwordResetCode:hashResetCode,
      passwordResetExpires:{$gt:Date.now()}

  })
  if(!user){
      return next(new appError("reset code invlaid or expire"))
  }
  if (req.body.password === req.body.confirmPassword) {
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetCode=undefined;
    user.passwordResetExpires= undefined;
    user.passwordResetVerified=undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    res.status(200).json({data:"success"})
  } else {
    return next(
      new appError("Passeword not the same of confirmPassword ", 500)
    );
  }


})
const updatePassword = asyncHandler(async (req, res, next) => {
  console.log("req.currentUser._id", req.currentUser._id);
  const user = await userModel.findById(req.currentUser._id);
  //check the old password
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return next(new appError("the currentPassword is incorrect", 400));
  }
  //check new Password
  if (req.body.newPassword === req.body.confirmPassword) {
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
  } else {
    return next(
      new appError("New Passeord and Confirm Passeord are different", 400)
    );
  }
  //return response with new token
  const tokenLogin = createToken(user._id);

  res.status(200).json({
    status: "success",
    data: {
      user: user,
      token: tokenLogin,
    },
  });
});

const currentUser = asyncHandler(async (req, res, next) => {
  console.log("req.currentUser._id", req.currentUser._id);
  const user = await userModel
    .findById(req.currentUser._id)
    .select("-password -confirmPassword -active");
  console.log("user", user);

  res.status(201).json({
    status: "success",
    data:  user ,
  });
});
module.exports={
    login,
    protect,
    forgetPassword,
    verifyResetCode,
  
    updatePassword,
    currentUser,
}