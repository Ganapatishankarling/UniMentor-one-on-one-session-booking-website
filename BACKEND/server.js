import express from 'express';
import configureDB from './config/db.js';
import cors from 'cors'
// import dotenv from 'dotenv'


const app = express()
const port = 3047;
app.use(cors())
app.use(express.json())
configureDB()
// dotenv.config()


import { userRegisterValidationSchema,userLoginValidationSchema } from './app/validators/UserRegisterValidationSchema.js'
import { checkSchema } from 'express-validator'
import { userAuthentication } from './app/middlewares/User-Authentication.js'
import { userAuthorization } from './app/middlewares/User-Authorization.js'
import { sessionValidationSchema } from './app/validators/SessionValidationSchema.js'
import { forgotPasswordValidationSchema } from './app/validators/ForgotPasswordValidationSchema.js'
import { updateBasicProfileValidationSchema } from './app/validators/ProfileValidationSchema.js';
import {updateEducationAndBioValidationSchema} from './app/validators/ProfileValidationSchema.js'
import {PaymentValidationSchema} from './app/validators/PaymentValidationSchema.js'

import userController from './app/controllers/User-Controller.js'
import sessionController from './app/controllers/SessionController.js'


// for account
app.post('/register',checkSchema(userRegisterValidationSchema),userController.register)
app.post('/login',checkSchema(userLoginValidationSchema),userController.login)
app.get('/users',userAuthentication,userAuthorization(['admin']),userController.list)
app.get('/user/:id',userAuthentication,userController.account)
app.post('/forgot-password',checkSchema(forgotPasswordValidationSchema),userController.forgotPassword)
app.put('/user/:id/basic-Profile',userAuthentication,checkSchema(updateBasicProfileValidationSchema),userController.updateBasicProfile)
app.put('/user/:id/education-bio',userAuthentication,checkSchema(updateEducationAndBioValidationSchema),userController.updateEducationAndBio)

app.delete('/users/:id',userAuthentication,userController.remove)

// for session
app.get('/list-sessions',userAuthentication,sessionController.list)
app.post('/create-session',userAuthentication,userAuthorization(['admin','mentor']),checkSchema(sessionValidationSchema),sessionController.create)
app.put('/update-session/:id',userAuthentication,userAuthorization(['admin','mentor']),checkSchema(sessionValidationSchema),sessionController.updateStatus)
app.put('/session/:id/reschedule',userAuthentication,userAuthorization(['admin','mentor']),checkSchema(sessionValidationSchema),sessionController.reschedule)
app.put('/session/:id/link',userAuthentication,userAuthorization(['admin','mentor']),checkSchema(sessionValidationSchema),sessionController.updateMeetingLink)
app.put('/session/:id/update-payment',userAuthentication,userAuthorization(['admin']),checkSchema(PaymentValidationSchema),sessionController.updatePaymentStatus)
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})