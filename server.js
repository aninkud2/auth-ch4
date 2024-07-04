const express=require("express")

require("dotenv").config()
const app=express()
app.use(express.json())

const router=require("./router/userRouter")
app.use("/api/v1/",router)
const url=process.env.mongodbUrl
const port=process.env.port

const mongoose=require("mongoose")

mongoose.connect(url).then(()=>{
    console.log("connection to database established")
    app.listen(port,()=>{console.log("my app is connected on port "+port)})
}).catch((error)=>{
    console.log("unable to connect because "+error)
})  