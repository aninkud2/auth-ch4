const userModel=require("../model/userModel")
const sendMail = require("../helpers/email")
const bcrypt=require("bcryptjs")

exports.createUser =async (req,res)=>{

    try {
const{firstName,lastName,email,phoneNumber,passWord}=req.body


const bcryptpassword=await bcrypt.genSaltSync(10)

const hashedPassword =await bcrypt.hashSync(passWord,bcryptpassword)

const data={firstName,
    lastName,
    email,
    phoneNumber,
    passWord:hashedPassword
}

const createdUser = await userModel.create(data)

sendMail({
    subject : `Kindly Verify your mail`,
    email:createdUser.email,
    message:`Welcome ${createdUser.firstName}  ${createdUser.lastName}  kindly click on the button below to verify your account`
})

res.status(201).json({
    message:`Welcome ${createdUser.firstName} kindly check your gmail to access the link to verify your email`,
    data:createdUser
})
        
    } catch (error) {
      res.status(500).json(error.message)  
    }
}