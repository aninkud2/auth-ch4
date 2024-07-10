const router=require("express").Router()

const {createUser,verifyEmail,newEmail, logIn, updateUser}=require("../controller/userController")

const {authenticator}= require("../helpers/authentication")
const {authorization}=require("../helpers/authorization")

router.post("/createuser",createUser)

router.get("/verify/:id/:token",verifyEmail)

router.get("/newemail/:id",newEmail)
router.patch("/updateUser/:id",authorization, updateUser)



router.post("/login",logIn)


router.get("/",authenticator,(req,res)=>{
    res.status(200).json(`Welcome to my api ${req.user}`)
})


module.exports=router 