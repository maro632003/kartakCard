
const placeRoute=require("./placeRoute")
const userRoute=require("./userRoute")
const authRoute=require("./authRoute")
const orderRoute=require("./orderRoute")
const reviewRoute=require("./reviewRoute")

const mainRoute=(app)=>{
    app.use("/api/place",placeRoute)
    app.use("/api/user",userRoute)
    app.use("/api/auth",authRoute)
    app.use("/api/order",orderRoute)
    app.use("/api/review",reviewRoute)

    

}
module.exports=mainRoute