import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/profileImages')
    },
    filename:function(req,file,cb){
        const ext = path.extname(file.originalname)
        cb(null,`${Date.now()}${ext}`)
    }
})

const fileFilter = (req,file,cb)=>{
//   const allowedTypes = /image\/jpeg|image\/jpg|image\/png/
//     const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    // if(isValid){
        cb(null,true)
    // }else{
    //     cb(new Error('Only images are allowed (jpeg,jpg,png)'))
    // }
}

const upload = multer({storage,fileFilter})

export default upload