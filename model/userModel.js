const mongoose=require("mongoose")


const userSchema=new mongoose.Schema({

firstName:String,

lastName:String,

passWord:String,

email:{type:String},

phoneNumber:String


},{timestamps:true})


const userModel = mongoose.model("user auth",userSchema)

module.exports= userModel