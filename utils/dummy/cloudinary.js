const cloudinary=require('cloudinary')

const dotenv=require("dotenv")
const {env}=require("process")
dotenv.config({path:"config.env"})
console.log("API_KEY",process.env.PORT);
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_ClOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})  

//Cloudinary Upload Image
const cloudinaryUploadImage = async(FileToUpload)=>{
    try {
        const data = await cloudinary.uploader.upload(FileToUpload,{
            resource_type:'auto',
        })
        return data;
    } catch (error) {
        return error
    }
}

//Cloudinary Remove Image
const cloudinaryRemoveImage = async(imagePublicId)=>{
    try {
        const result =await cloudinary.uploader.destroy(imagePublicId)
        return result;
    } catch (error) {
        return error
    }
}

module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage
}