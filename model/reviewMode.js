const { string } = require("i/lib/util")
const mongoose=require("mongoose")
const { type } = require("os")
const placeModel=require("./placeModel")
const reviewSchema=mongoose.Schema({
    title : {
        type:String,
        required:[true,"title is required"]
    },

    rate: {
        type:Number,
        required:[true,"rate is required"],
        min:[1,"rate must be greater than 0"],
        max:[5,"rate must be less than 5"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
       
    },
    place:{
        type:mongoose.Schema.ObjectId,
        ref:"place"
    }

})

reviewSchema.statics.calcRatingAverageAndRatingQuantity=async function(placeId){
    console.log("kkkk")
    const result=await this.aggregate([
        { $match:{place:placeId}},
        {$group:{
            _id:"$place",
            rate:{$avg:'$rate'},
            ratingQuantity:{$sum:1}

            
        }}
    ])
    
    console.log(result)
    if(result.length>0){
        await placeModel.findByIdAndUpdate(placeId,{
            rate:result[0].rate,
            ratingQuantity:result[0].ratingQuantity
            


        })
    }
    else{
        await placeModel.findByIdAndUpdate(placeId,{
            ratingAverage:0,
            ratingQuantity:0
            


        })

    }


}
reviewSchema.post("save",async function(){
    await this.constructor.calcRatingAverageAndRatingQuantity(this.place)
})
;
reviewSchema.post("remove",async function(){
    await this.constructor.calcRatingAverageAndRatingQuantity(this.place)

})

const reviewModel=mongoose.model("review",reviewSchema);

module.exports=reviewModel