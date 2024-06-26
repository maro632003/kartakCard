const { string } = require("i/lib/util")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is ruqired"],
        unique:true,
        lowercase:true
    },
    slug:{
        type:String,
        lowercase:true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        lowercase:true
    },
    phone:{
        type:String,
        required:[true,"pnone is required"]
    },
    profileImage:{
        type:String,
        required:[true,"profileImage is required"]

    },
    password:{
        type:String,
        required:[true,"password is required"],
        minLength:[5,"too short password"]

    },
    confirmPassword:{
        type:String,
        required:['Confirm your Password']
        
    
    },
    role:{
        type:String,
        enum:["user","admin","manger"],
        default:"user"
    },
    active:{
        type:Boolean,
        default:true
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetCode:String,
    passwordResetExpires:String,
    passwordResetVerified:String,
    date:Date,
    cashBack:{
        type:Number,
        default:0

    },
    cloudImage: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null,
        }
    },
    



},{timestamps:true})
userSchema.pre("save",async function(next){
 
  
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,parseInt(process.env.BECRYPT))
})


const userModel=mongoose.model("user",userSchema)
module.exports=userModel















