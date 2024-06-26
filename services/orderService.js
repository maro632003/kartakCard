const appError = require("../utils/dummy/apiError");
const placeModel=require("../model/placeModel")
const orderModel =require("../model/orderModel")
const asyncHandler = require("express-async-handler");
const { model } = require("mongoose");
const { configDotenv } = require("dotenv");
const { nextTick } = require("process");
const userModel = require("../model/userModel");
const stripe = require('stripe')('sk_test_51PKm4rH0IrZrduSRAqVe8SaShF2l66K82UTdapW660S9KpJiiqZygJmHgUvZhf4VMxQeTl5mIDgoZ8a1GE7wXGQj009W4TlcCz');



const createOrder=asyncHandler(async(req,res,next)=>{

    const place =await placeModel.findOne({code:req.body.code})
    // const user=await userModel.findById(req.)
    
    const {code,totalPrice,owner}=req.body
    if(place.code==code && owner==place.owner){
        const  totalPriceAfterDiscount = totalPrice-((totalPrice * place.discount) / 100)
        const cashBack=((totalPrice * place.discount) / 100)
        const order= await orderModel.create({
            user:req.currentUser._id,
            place:place._id,
            paidAt:Date.now(),
            totalPrice:totalPrice,
            totalPriceAfterDiscount:totalPriceAfterDiscount,
            owner:owner,
            cashBack:cashBack
            
        })
       
        if(!order){
            return next(new appError("the is problem on create this order",400))
        }
      
         res.status(200).json({status:"success",data:order})

    }
    else {


        return next (new appError("invalid owner or code ",400))
    }
   
    
    
})

const getAllOrder=asyncHandler(async(req,res,next)=>{

    const order=await orderModel.find()
    if(!order){
        return next(new appError("there is no orders ",400))
    }
    res.status(200).json({status:"success",data:order})
})
const getSpecificOrder=asyncHandler(async(req,res,next)=>{
    const order =await orderModel.findById(req.params.id)
    if(!order){
        return next(new appError("there is no orders ",400))
    }
    res.status(200).json({status:"success",data:order})

})

const getLoggedUserOrder=asyncHandler(async(req,res,next)=>{
  
    const order =await orderModel.find({user:req.currentUser._id})
    if(!order){
        return next (new appError(`there is no order for this user ${req.currentUser._id}`))
    }
    res.status(200).json({status:"success",data:order})
})

const checkoutSession=asyncHandler(async(req,res,next)=>{

    const session= await stripe.checkout.sessions.create({
        line_items:[
            {
                price_data: {
                    currency: "egp",
                    product_data: {
                        name: req.currentUser.name,
                        
                    },
                    unit_amount:req.body.totalPrice  * 100, 
                },
                quantity: 1
            }
        ],

        mode: 'payment',
        client_reference_id:req.body.code,
        customer_email: req.currentUser.email,
        success_url: `${req.protocol}://${req.get("host")}/api/place`,
        cancel_url: `${req.protocol}://${req.get("host")}/api/order`,
    })
    res.status(200).json({status:"success",data:session})
})

const webhookChecout=asyncHandler(async(req,res,next)=>{
    

    const sig = req.headers['stripe-signature'];
  

    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig,`${process.env.STRIPE_WEBHOOK_SECRET}`);

    } catch (err) {
        console.log("error ")
     return res.status(400).send(`Webhook Error: ${err.message}`);
   
    }

    if(event.type =="checkout.session.completed"){

        console.log("create order her ..........")

        createCardOrder(event.data.object)

    }
})

const createCardOrder=async(session)=>{
const code= session.client_reference_id
const userEmail=session.customer_email
const totalPrice=session.amount_total / 100
const place =await placeModel.findOne({code:code})
const user=await userModel.findOne({email:userEmail})

const  totalPriceAfterDiscount = totalPrice-((totalPrice * place.discount) / 100)
const cashBack=((totalPrice * place.discount) / 100)



console.log(place.discount,typeof(place.discount),place.name)
console.log(place,user)

const  order= await orderModel.create({
    user:user._id,
    place:place._id,
    paidAt:Date.now(),
    totalPrice:totalPrice,
    totalPriceAfterDiscount:totalPriceAfterDiscount,
    owner:place.owner,
    cashBack:cashBack,
    paymentTypeMethod:"card"

})



}


const cashBackOrder=asyncHandler(async(req,res,next)=>{

console.log(req.currentUser.cashBack)
  if(req.body.totalPrice>req.currentUser.cashBack){
    return next(new appError("the totailprice is greater than your cashBack",400))
  }


  const place =await placeModel.findOne({code:req.body.code})
  
  const {code,totalPrice,owner}=req.body
  if(place.code==code && owner==place.owner){
      const  totalPriceAfterDiscount = totalPrice-((totalPrice * place.discount) / 100)
      const cashBack= req.currentUser.cashBack-req.body.totalPrice
      const order= await orderModel.create({
          user:req.currentUser._id,
          place:place._id,
          paidAt:Date.now(),
          totalPrice:totalPrice,
          totalPriceAfterDiscount:totalPrice,
          owner:owner,
          cashBack:cashBack
          
      })
     
      if(!order){
          return next(new appError("the is problem on create this order",400))
      }
     
    
       res.status(200).json({status:"success",data:order})

  }
  else {


      return next (new appError("invalid owner or code ",400))
  }
 
    

})


const deleteLoggedUserOrders=asyncHandler(async(req,res,next)=>{
    const order =await orderModel.deleteMany({user:req.currentUser._id})
  if(!order){
    return next (new appError (`no orders for this id ${req.currentUser._id}`,400))
  }
  res.status(200).json({status:"success",data:order})

})

module.exports={

     createOrder,
     getAllOrder,
     getSpecificOrder,
     getLoggedUserOrder,
     checkoutSession,
     cashBackOrder,
     deleteLoggedUserOrders,

     webhookChecout

}