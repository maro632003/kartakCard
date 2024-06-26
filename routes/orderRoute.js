const express=require("express")
const router=express.Router()
const {createOrder,getAllOrder,getSpecificOrder,getLoggedUserOrder,checkoutSession,cashBackOrder,deleteLoggedUserOrders}=require("../services/orderService")
const {protect}=require("../services/authService")

router.route("/").post(protect,createOrder).get(protect,getAllOrder).delete(protect,deleteLoggedUserOrders)
router.route("/checkout-session").get(protect,checkoutSession)
router.route("/loggedUser").get(protect,getLoggedUserOrder)
router.route("/:id").get(protect,getSpecificOrder)
router.route("/cashBack").post(protect,cashBackOrder)







module.exports=router


