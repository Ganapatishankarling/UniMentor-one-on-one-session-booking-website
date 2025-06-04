import { model, Schema } from "mongoose";

const OTPSchema = new Schema({
    email:{type:String,required:true},
    otp:{type:Number,required:true},
    otpExpiryAt:Date,
    isVerified :{type:Boolean,default:false}
},{timestamps:true})

const OTPModel = model('OTP',OTPSchema)
export default OTPModel