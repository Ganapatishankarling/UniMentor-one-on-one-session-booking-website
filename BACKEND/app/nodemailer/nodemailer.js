import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: true,

  secureConnection: false,
  auth:{
    user:'ganapatishankarling@gmail.com',                
    pass: "kggn llke tulz hbit",
             
},
  tls: {
    rejectUnauthorized: true,
  },
});