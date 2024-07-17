const userModel=require("../model/userModel")
const sendMail = require("../helpers/email")
const bcrypt=require("bcryptjs")
require("dotenv").config()
const html=require("../helpers/html.js")
const jwt= require("jsonwebtoken")
const cloudinary= require("../helpers/cloudinary.js")

const fs = require("fs")
exports.createUser =async (req,res)=>{

    try {
const{firstName,lastName,email,phoneNumber,passWord}=req.body
const checkIfAnEmailExists= await userModel.findOne({email:email.toLowerCase()})

if(checkIfAnEmailExists){
    return res.status(400).json("user with this email already exists")
}
const bcryptpassword=await bcrypt.genSaltSync(10)

const hashedPassword =await bcrypt.hashSync(passWord,bcryptpassword)

if(!req.file){
   return  res.status(400).json("Kindly upload your profile picture")
}
const cloudProfile=await cloudinary.uploader.upload(req.file.path,{folder:" users dp"},(err)=>{
    if(err){
        return res.status(400).json(err.message)
    }
})

const data={firstName,
    lastName,
    email:email.toLowerCase(),
    phoneNumber,
    passWord:hashedPassword,
    profilePicture:{
        pictureId:cloudProfile.public_id,
        pictureUrl:cloudProfile.secure_url
    }
}

const createdUser = await userModel.create(data)

fs.unlink(req.file.path,(err)=>{
    if(err){
        return res.status(400).json("unable to delete users profile"+err)
    }
})
const userToken = jwt.sign({id:createdUser._id,email:createdUser.email},process.env.jwtSecret,{expiresIn: "3 Minutes"})
const verifyLink=  `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`

sendMail({ subject : `Kindly Verify your mail`,
    email:createdUser.email,
    html:html(verifyLink,createdUser.firstName)
    // message:`Welcome ${createdUser.firstName}  ${createdUser.lastName}  kindly click on the button below to verify your account /   ${verifyLink}`
})

res.status(201).json({
    message:`Welcome ${createdUser.firstName} kindly check your gmail to access the link to verify your email`,
    data:createdUser
})
        
    } catch (error) {
      res.status(500).json(error.message)  
    }
}

//create an end point to verify users email


exports.verifyEmail=async (req,res)=>{
    try {
const id=req.params.id
    const findUser=await userModel.findById(id)
await jwt.verify(req.params.token,process.env.jwtSecret,(err)=>{
    if(err  ){
        const link=`${req.protocol}://${req.get("host")}/api/v1/newemail/${findUser._id}`

        sendMail({ subject : `Kindly Verify your mail`,
            email:findUser.email,
            html:html(link,findUser.firstName)
          
        })
 
    return res.json(`this link has expired ,kindly check your email link`)
      
    }else{
        if(findUser.isVerified == true){
            return res.status(400).json("your account has already been verified")
        }
    userModel.findByIdAndUpdate(id,{isVerified:true})
    
        res.status(200).json("you have been verified,kindly go ahead to log in")
    }
})
    
        
    } catch (error) {
        res.status(500).json(error.message)  
      
    }
}

exports.newEmail=async(req,res)=>{
    try {

        const user=await userModel.findById(req.params.id)
        const userToken = jwt.sign({id:user._id,email:user.email},process.env.jwtSecret,{expiresIn: "3 Minutes"})
        const reverifyLink= `${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}/${userToken}`
        sendMail({ subject : `Kindly re Verify your email`,
            
            email:user.email,
            html:html(reverifyLink,user.firstName)}
        )
       



    } catch (error) {
       res.status(500).json(error.message) 
    }
}


exports.logIn= async (req,res)=>{
try {

    const {email,password}=req.body

    const findWithEmail=await userModel.findOne({email:email.toLowerCase()})
    if(!findWithEmail){
        return res.status(404).json(`user with  the email ${email} does not exist`)
    }
    // const bcryptPassword=findWithEmail.passWord
    const checkPassword=await bcrypt.compare(password,findWithEmail.passWord)
    if(!checkPassword){
        return res.status(400).json("password in correct")
    }

    const user=await jwt.sign({id:findWithEmail._id,},process.env.jwtSecret,{expiresIn: "7 minutes"})


const{isVerified ,phoneNumber,createdAt,updatedAt,__v,_id,passWord, ...others}=findWithEmail._doc


    res.status(200).json({message:"login Successful",data: others,token:user})
} catch (error) {
    res.status(500).json(error.message)  
}
}

//update a user

exports.updateUser = async (req, res)=>{
    try {
        const userId = req.params.id;
        const {firstName,phoneNumber,lastName}=req.body

        const data={
            firstName,
            phoneNumber,
            lastName
        }
        const updatedUser = await userModel.findByIdAndUpdate(userId, data,{new:true});
       
         return   res.status(200).json({
                message: "user updated successfully",
                data: updatedUser
            })
        
        

        
    } catch (error) {
      return  res.status(500).json(error.message)
    }
}



exports.makeAdmin =async(req,res)=>{
try {
  const newAdmin=  await userModel.findByIdAndUpdate(req.params.id,{isAdmin:true})
    res.status(200).json({
        message:`${newAdmin.firstName} is now an admin`
    })


} catch (error) {
    res.status(500).json(error.message)
}
}



exports.updatePicture=async(req,res)=>{
try {
const userToken= req.headers.authorization.split(" ")[1]
if(!req.file){
    return res.status(400).json("no profile picture selected")
}
await jwt.verify(userToken,process.env.jwtSecret,async(err,newUser)=>{
    if(err){
        return res.status(400).json("could not authenticate")
    }else {

       req.user=newUser.id 

    
    const cloudImage=await cloudinary.uploader.upload(req.file.path,{folder:" users dp"},(err,data)=>{
        if(err){
          console.log(err)
        }
    // cloudinary.uploader.destroy()
        return data
    })
    const userId=newUser.id
    
    console.log(userId)

const pictureUpdate= {profilePicture:{
    pictureId:cloudImage.public_id,

    pictureUrl:cloudImage.secure_url 
}}

const user= await userModel.findById(userId)
const formerImageId=user.profilePicture.pictureId
await cloudinary.uploader.destroy(formerImageId)

    const checkUser= await userModel.findByIdAndUpdate(userId,pictureUpdate,{new:true})
    
    
    return res.status(200).json({message :"user image sucessfully changed"})



    }
})

    
} catch (error) {
 res.status(500).json(error.message)   
}


}