const router=require("express").Router()

const {createUser}=require("../controller/userController")


router.post("/createuser",createUser)


module.exports=router