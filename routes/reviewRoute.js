const express=require("express");
const router=express.Router();

const {protect}=require("../services/authService")
const {createReview,getSpecificReview,getAllReview,deleteReview}=require("../services/reviewService");

router.route("/").post(protect,createReview).get(getAllReview)
router.route("/:id").get(getSpecificReview).delete(deleteReview)



module.exports=router
