const express=require("express");
const router=express.Router();

const multer  = require('multer')


const {protect}=require("../services/authService")

const{createPlace,uploadImage,reasizeImage,getSpecificPlace,getAllPlace,DeletePlace,updatePlace}=require("../services/placeService")

router.route("/").post(uploadImage,reasizeImage,createPlace)
.get(getAllPlace)
router.route("/:id").get(getSpecificPlace)
.put(uploadImage,reasizeImage,updatePlace)
.delete(DeletePlace)


module.exports=router;