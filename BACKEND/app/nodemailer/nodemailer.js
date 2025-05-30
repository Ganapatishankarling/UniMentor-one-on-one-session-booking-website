import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
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