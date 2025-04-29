import nodemailer from 'nodemailer'

const sendEmail = async(to,subject,text)=>{
    try{
        const testAccount = await nodemailer.createTestAccount()

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'ganapati123@gmail.com',                
                pass:'ganapati123'                
            }
        })

        const info = await transporter.sendMail({
            from:`"Uni Mentor" <ganapatishankarling@gmail.com>`,
            to,
            subject,
            text
        })
        console.log(info.messageId)
        console.log(nodemailer.getTestMessageUrl(info))
    }catch(err){
        console.log('Email Sending failed',err)
    }
}
export default sendEmail