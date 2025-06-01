
import OTPModel from '../models/OtpModel.js';
import UserModel from '../models/UserModel.js';

import { sendVerificationEmail } from "../nodemailer/emails.js";

const OTPController = {}
OTPController.sendOtp = async(req,res)=>{
    try {
        const {email} = req.body
        const otpDigit = Math.floor(100000 + Math.random() * 900000).toString();
        const user = await UserModel.findOne({email})
        if(user){
            res.status(400).json({message:"User already exist"})
        }
        const otpExpiryAt = new Date(Date.now() + 10 * 60 * 1000)
        const body = {
            email,
            otp:otpDigit,
            otpExpiryAt:otpExpiryAt
        }
        sendVerificationEmail({email:email,message:'Verify your account',verificationToken:otpDigit});
        const saveOtp = new OTPModel(body)
        await saveOtp.save()
       return res.status(200).json({message:"Otp send successfully",data:body})
        
    } catch (error) {
          console.log(error)
        return res.status(500).json({errors:error})
    }
}

OTPController.verify = async(req,res)=>{
    try {
        const {email,otp} = req.body
        const userOtp = await OTPModel.findOne({email})
       
        if (!otp) {
             return res.status(400).json({ errors: 'No OTP found for this email' });
        }
        
        if(userOtp.otp !== otp || userOtp.otpExpiryAt  < new Date()){
        
        await OTPModel.findOneAndDelete({email})
        return res.status(400).json({errors:'OTP does not match or OTP expired'})
        }
        userOtp.isVerified = true
        await userOtp.save()
        
        return res.status(200).json({message:'OTP verified successfully'})

    } catch (error) {
          console.log(error)
          
        return res.status(500).json({errors:error.message})
    }
}

export default OTPController