import mongoose from 'mongoose';
const configureDB = async()=>{
    const url = "mongodb://localhost:27017/UniMentor-2025"
    try{
        await mongoose.connect(url)
        console.log('connected to db')
    }catch(err){
        console.log('error connecting to db')
    }
}
export default configureDB