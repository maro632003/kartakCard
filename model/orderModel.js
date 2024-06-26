const { string } = require("i/lib/util")
const mongoose=require("mongoose")
const userModel=require("./userModel")

const orderSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:["true","user is reqired"]
    },
    place:{
        type:mongoose.Schema.ObjectId,
        ref:"place",
        required:[true,"place is reqired"]
    },
    paymentTypeMethod:{
        type:String,
        enum:["cash","card"],
        default:"cash"

    },
    paidAt:Date,

    totalPrice:{
        type:Number,
        required:[true,"totalPrice is reqired "]
    },

    totalPriceAfterDiscount:{
        type:Number
    },
    owner:{
        type:String,
        required:[true,"owner is reqired"]
    },
    
    cashBack:Number
    

},{timestamps:true})



orderSchema.statics.calcRatingAverageAndRatingQuantity=async function(userId){
    console.log("kkkk")
    const result=await this.aggregate([
        { $match:{user:userId}},
        {$group:{
            _id:"$user",
            cashBack:{$sum:"$cashBack"}

            
        }}
    ])
    
    console.log(result)
    if(result.length>0){
        await userModel.findByIdAndUpdate(userId,{
            cashBack:result[0].cashBack,
           
            


        })
    }
    // else{
    //     await userModel.findByIdAndUpdate(userId,{
    //         cashBack:0
            


    //     })

    // }


}
orderSchema.post("save",async function(){
    await this.constructor.calcRatingAverageAndRatingQuantity(this.user)
})
;
orderSchema.post("remove",async function(){
    await this.constructor.calcRatingAverageAndRatingQuantity(this.user)

})



const orderModel =mongoose.model("order",orderSchema)
module.exports=orderModel