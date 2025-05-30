import nodemailer from 'nodemailer';
import { transporter } from './nodemailer.js';
import { verificationEmailTemplate,welcomeEmailTemplate } from './email-template.js';

export const sendVerificationEmail= async (user)=>{
  
    const mailOptions = {
        from: 'ganapatishankarling66@gmail.com',
        to: user.email,
        subject: user.message,
        text: user.message,
        html:verificationEmailTemplate.replace("{verificationCode}",user.verificationToken)
    };

    try{
        await transporter.sendMail(mailOptions);
    }catch(error){
        console.log(error)
    }
};


export const sendWelcomeEmail=async(user)=>{
    const mailOptions = {
        from: 'ganapatishankarling66@gmail.com',
        to: user.email,
        subject: user.message,
        text: user.message,
        html:welcomeEmailTemplate.replace("{name}",user.name)
    };

    try{
        transporter.sendMail(mailOptions);
    }catch(error){
        console.log(error)
    }
};


export const sendResetPasswordEmail = async(data)=>{
    const mailOptions = {
        from: 'ganapatishankarling66@gmail.com',
        to: data.email,
        subject: 'reset possword',
        text: data.token,
        html:welcomeEmailTemplate.replace("{name}",data.token)
    };

    try{
        transporter.sendMail(mailOptions);
    }catch(error){
        console.log(error)
    }
};