import express from 'express';
import configureDB from './config/db.js';
import cors from 'cors';
// import dotenv from 'dotenv'
import upload from './app/middlewares/upload.js'


const app = express();
const port = 3047;
app.use(cors())
app.use(express.json())
app.use('/uploads/profileImages',express.static('uploads/profileImages')) // for profile image upload
configureDB()
// dotenv.config()


import { userRegisterValidationSchema,userLoginValidationSchema } from './app/validators/UserRegisterValidationSchema.js'
import { checkSchema } from 'express-validator'
import { userAuthentication } from './app/middlewares/User-Authentication.js'
import { userAuthorization } from './app/middlewares/User-Authorization.js'
import { sessionValidationSchema } from './app/validators/SessionValidationSchema.js'
import { forgotPasswordValidationSchema } from './app/validators/ForgotPasswordValidationSchema.js'
import { profileValidationSchema } from './app/validators/ProfileValidationSchema.js'
import {reviewValidationSchema} from "./app/validators/ReviewValidationSchema.js"
import {reviewUpdateValidationSchema} from './app/validators/ReviewValidationSchema.js'
import {categoryValidationSchema} from './app/validators/CategoryValidationSchema.js'

import userController from './app/controllers/User-Controller.js'
import sessionController from './app/controllers/SessionController.js'
import reviewController from './app/controllers/ReviewController.js'
import paymentController from './app/controllers/PaymentController.js'
import categoryController from './app/controllers/CategoryController.js'


// for account
app.post('/register',checkSchema(userRegisterValidationSchema),userController.register)
app.post('/login',checkSchema(userLoginValidationSchema),userController.login)
app.get('/users',userAuthentication,userAuthorization(['admin','student']),userController.list)
app.get('/users/:id',userAuthentication,userAuthorization(['admin','student']),userController.listById)
app.get('/account',userAuthentication,userAuthorization(['admin','mentor','student']),userController.account)
app.put('/forgot-password',checkSchema(forgotPasswordValidationSchema),userController.forgotPassword)
app.put('/user/:id/profile',userAuthentication,checkSchema(profileValidationSchema),upload.single('profileImage'),userController.updateProfile)
app.delete('/users/:id',userAuthentication,userController.remove)

// for session
app.get('/list-sessions',userAuthentication,sessionController.list)
app.post('/add-session',userAuthentication,userAuthorization(['mentor']),checkSchema(sessionValidationSchema),sessionController.create)
// app.post('/session/:id/book',userAuthentication,userAuthorization(['student']),sessionController.book)
app.put('/update-session/:id/status',userAuthentication,userAuthorization(['admin','mentor']),checkSchema(sessionValidationSchema),sessionController.updateStatus)
app.put('/update-session/:id/reschedule',userAuthentication,userAuthorization(['mentor']),checkSchema(sessionValidationSchema),sessionController.reschedule)
app.put('/update-session/:id/meetingLink',userAuthentication,userAuthorization(['mentor']),checkSchema(sessionValidationSchema),sessionController.updateMeetingLink)
app.put('/update-session/:id/cancel',userAuthentication,userAuthorization(['student']),checkSchema(sessionValidationSchema),sessionController.cancel)

// for review
app.get('/reviews',userAuthentication,reviewController.list)
app.post('/reviews',userAuthentication,userAuthorization(['student']),checkSchema(reviewValidationSchema),reviewController.create)
app.put('/reviews/:id',userAuthentication,userAuthorization(['student']),checkSchema(reviewUpdateValidationSchema),reviewController.update)
app.delete('/reviews/:id',userAuthentication,userAuthorization(['student']),reviewController.delete)

// for payment
// app.get('/list-payments',userAuthentication,paymentController.list)
// app.post('/create-payment',userAuthentication,checkSchema(paymentValidationSchema),paymentController.create)
// app.put('/update-payment/:id',userAuthentication,checkSchema(paymentValidationSchema),paymentController.updateStatus)
// app.delete('/delete-payment/:id',userAuthentication,paymentController.delete)

// for category
app.get('/categories',userAuthentication,checkSchema(categoryValidationSchema),categoryController.list)
app.post('/category',userAuthentication,userAuthorization(['admin']),checkSchema(categoryValidationSchema),categoryController.create)
app.put('/update-category/:id',userAuthentication,userAuthorization(['admin']),checkSchema(categoryValidationSchema),categoryController.update)
app.get('/category/:id',userAuthentication,userAuthorization(['admin']),categoryController.getCategory)
app.delete('/delete-category/:id',userAuthentication,userAuthorization(['admin']),categoryController.delete)

// for payment
app.post('/rjpayment',paymentController.create)

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})