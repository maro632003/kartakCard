const { check } = require("express-validator")
const validator =require("../../../middleware/validator")
const userModel=require("../../../model/userModel")
const slugify =require("slugify")

const createUserValidator=[
    check("name").notEmpty().withMessage("name cant be empty")
    .isLength({max:60}).withMessage("too long for name")
    .isLength({min:3}).withMessage("too short for the name")
    .custom((val,{req})=>{
        console.log(req.body)
        req.body.slug=slugify(val)
        return true;
    }),
    check("email").notEmpty().withMessage("there is must be an email")
    .isEmail().withMessage("must be an email ")
    .custom((val)=>{
        userModel.findOne({email:val}).then((user)=>{
            if(user){
                return Promise.reject(new Error("email is existed"))
            }
        })
      
    }
    )
    ,
    check("passwordConfirmation").notEmpty().withMessage("passwordConfirmation is required")
    .custom((val,{req})=>{
        if(val!=req.body.password){
            throw new Error("passwordConfirmation not match")
        }
    }),
    check("password").notEmpty().withMessage("password is required an must be exist")
    .isLength({min:4}).withMessage("to short too be an password")
    ,
    check("phone").isMobilePhone("ar-EG").withMessage("only egyption number is allowed")

    
    ,validator]
  
const getUserValidator=[
        check("id").isMongoId().withMessage("invalid user id")
        
        
        ,validator]

const deleteUserValidator=[check("id").isMongoId().withMessage("invalid user id"),validator]

const updateUserValidator=[
        check("id").isMongoId().withMessage("invalid user id"),
        check("name")
        .custom((val,{req})=>{
            req.body.slug=slugify(val)
            return true
        }),
        check("phone").isMobilePhone("ar-EG").withMessage("only egyption number"),
        check("email").notEmpty().withMessage("email cannt be empty")
        .custom((val,{req})=>{
            userModel.findOne({email:val}).then((user)=>{
                return Promise.reject(new Error("email is existed"))
            })
            return true;
        })
    ,validator
]

module.exports={
    createUserValidator,
    getUserValidator,
    deleteUserValidator,
    updateUserValidator

}