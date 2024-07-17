
const multer = require("multer")

const path = require("path")
const storage=multer.diskStorage({

destination:function(req,file,cb){

    cb(null,"./media")
},
filename:function(req,file,cb){
   cb(null,file.originalname) 
},



}
)

const uploader=multer({storage,
    fileFilter:function(req,file,cb){
        const extension= path.extname( file.originalname )

        if(extension == ".png" ||  extension == ".jpg" || extension ==".jpeg") {
            cb (null,true)
        }else{
            cb (new Error ("unsupported format"))
        }
    },
    limits:{fileSize:1024*1024}
    
})

module.exports ={uploader}