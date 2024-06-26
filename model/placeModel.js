const { string } = require("i/lib/util");
const mongoose=require("mongoose");
const placeSchema=mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"name is required"],
        maxlength:[200,"too long name"],
        minlength:[3,"too short name"]
    },
    slug:{
        type:String,
        required:true,
        lowercase:true
    },
    description:{
        type:String,
        required:[true,"description is required"],
        minlength:[20,"too short description"]
    },
    discount:{
        type:Number,
        required:[true,"discount is required"]
    },
    imageCover:{
        type:String,
        required:[true,"image is required"]
    }  ,
    categore:{
        type:String,
        required:[true,"categore is required"]
    }  ,
    ratingAverage:{
        type:Number,
        min:[1,"ratingAverage must be greater than 1"],
        min:[5,"ratingAverage must be greater than 1"]
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    cloudImage:{
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId:null,
        }
    },
    owner:{
        type:String,
        required:["true","owner name is required"]
    },
    code:{
        type:String,
        required:["true","code is reqired"]

    },
    ratingQuantity:{
        type:Number
    },
    rate:{
        type:Number
    }

    
 


},{timestamps:true})

const placeModel=mongoose.model("place",placeSchema)
module.exports=placeModel

