// import nodemailer from 'nodemailer'

// const sendEmail = async(to,subject,text)=>{
//     try{
//         const testAccount = await nodemailer.createTestAccount()

//         const transporter = nodemailer.createTransport({
//             service:'gmail',
//             auth:{
//                 user:'ganapati123@gmail.com',                
//                 pass:'ganapati123'                
//             }
//         })

//         const info = await transporter.sendMail({
//             from:`"Uni Mentor" <ganapatishankarling@gmail.com>`,
//             to,
//             subject,
//             text
//         })
//         console.log(info.messageId)
//         console.log(nodemailer.getTestMessageUrl(info))
//     }catch(err){
//         console.log('Email Sending failed',err)
//     }
// }
// export default sendEmail




import nodemailer from 'nodemailer'

var transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  // debug: true,
  // logger: true,
  secureConnection: false,
  auth:{
    user:'ganapatishankarling@gmail.com',                
    pass: "kggn llke tulz hbit",
             
},
  tls: {
    rejectUnauthorized: true,
  },
});

const sendEmail = async (to, subject, text) => {
  console.log("🚀 ~ sendEmail ~ to:", to);
  var mailOptions = {
    from: "ganapatishankarling@gmail.com",
    to,
    subject,
    text,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.response);
    return info;
  } catch (error) {
    console.log("Not sent", error);
    return error;
  }
};

export default sendEmail