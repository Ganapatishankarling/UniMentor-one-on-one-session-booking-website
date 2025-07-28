import express from 'express';
import configureDB from './config/db.js';
import cors from 'cors';
// import dotenv from 'dotenv'
import upload from './app/middlewares/upload.js'


const app = express();
const port = 3047;
app.use(cors())
app.use(express.json())

configureDB()
// dotenv.config()


import { userRegisterValidationSchema,userLoginValidationSchema } from './app/validators/UserValidationSchema.js'
import { checkSchema } from 'express-validator'
import { userAuthentication } from './app/middlewares/User-Authentication.js'
import { userAuthorization } from './app/middlewares/User-Authorization.js'
import { sessionValidationSchema } from './app/validators/SessionValidationSchema.js'
import { forgotPasswordValidation } from './app/validators/UserValidationSchema.js'
import { resetPasswordValidation } from './app/validators/UserValidationSchema.js'
import { profileValidationSchema } from './app/validators/ProfileValidationSchema.js'
import {reviewValidationSchema} from "./app/validators/ReviewValidationSchema.js"
import {reviewUpdateValidationSchema} from './app/validators/ReviewValidationSchema.js'
import {categoryValidationSchema} from './app/validators/CategoryValidationSchema.js'
import {
    
    
    
    slotOperationValidationSchema,
    checkSlotValidationSchema,
    availableSlotsValidationSchema,
    userExistsValidation
} from './app/validators/AvailabilityValidationSchema.js';
import {availabilityValidationSchema} from './app/validators/AvailabilityValidationSchema.js'
import {dayScheduleValidationSchema} from './app/validators/AvailabilityValidationSchema.js'
import {blockedDatesManagementValidationSchema} from './app/validators/AvailabilityValidationSchema.js'


import userController from './app/controllers/User-Controller.js'
import sessionController from './app/controllers/SessionController.js'
import reviewController from './app/controllers/ReviewController.js'
import categoryController from './app/controllers/CategoryController.js'
import paymentController from './app/controllers/PaymentController.js'
import OTPController from './app/controllers/OtpController.js';
import availabilityController from './app/controllers/AvailabilityController.js';
import bookingController from './app/controllers/BookingController.js';
import analyticsController from './app/controllers/AnalyticsController.js';



// for account
app.post('/register',checkSchema(userRegisterValidationSchema),userController.register)
app.post('/login',checkSchema(userLoginValidationSchema),userController.login)
app.get('/users',userAuthentication,userAuthorization(['admin','student']),userController.list)
app.get('/users/:id',userAuthentication,userAuthorization(['admin','student']),userController.listById)
app.get('/account',userAuthentication,userAuthorization(['admin','mentor','student']),userController.account)
app.post('/forgot-password',checkSchema(forgotPasswordValidation),userController.forgotPassword)
app.post('/reset-password',checkSchema(resetPasswordValidation),userController.resetPassword)
app.put('/user/:id/profile',userAuthentication,checkSchema(profileValidationSchema),upload.single('profileImage'),userController.updateProfile)
app.use('/uploads/profileImages',express.static('uploads/profileImages')) // for profile image upload
app.delete('/users/:id',userAuthentication,userController.remove)
app.patch('/mentorActivate/:id',userAuthentication,userAuthorization(['admin','mentor']),userController.updateMentorIsActive)
app.patch('/adminApprove/:id',userAuthentication,userAuthorization(['admin']),userController.updateAdminApproval)

// Availability Controller API Routes

// GET - Get availability by mentor ID (for public viewing)
app.get('/availability/mentor/:id', checkSchema(availableSlotsValidationSchema),availabilityController.getByMentorId);

// GET - Get current user's availability (mentor only)
app.get('/availability/my', userAuthentication,userAuthorization(['mentor']),checkSchema(userExistsValidation), availabilityController.getMy);

// POST - Create or update availability (mentor only)
app.post('/availability', userAuthentication,userAuthorization(['mentor']),checkSchema({...userExistsValidation,...availabilityValidationSchema}), availabilityController.createOrUpdate);

// PATCH - Update specific day schedule (mentor only)
app.patch('/availability/day/:day', userAuthentication,userAuthorization(['mentor']),checkSchema({...userExistsValidation,...dayScheduleValidationSchema}), availabilityController.updateDaySchedule);

// POST - Add blocked dates (mentor only)
app.patch('/availability/blocked-dates', userAuthentication,userAuthorization(['mentor']),checkSchema({...userExistsValidation}), availabilityController.manageBlockedDates);

// POST - Book a time slot (used when a session is created)
app.post('/availability/book-slot', checkSchema(slotOperationValidationSchema),availabilityController.bookSlot);

// GET - Get available slots for a specific mentor and date range
app.get('/availability/slots/:id', checkSchema(availableSlotsValidationSchema),availabilityController.getAvailableSlots);

// POST - Release a booked slot
app.post('/availability/release-slot', checkSchema(slotOperationValidationSchema),availabilityController.releaseSlot);

// GET - Check if a specific slot is available for booking
app.get('/availability/check/:mentorId/:day/:slotIndex', checkSchema(checkSlotValidationSchema),availabilityController.checkSlotAvailability);

// DELETE - Delete availability (mentor only)
app.delete('/availability', checkSchema(userExistsValidation), availabilityController.delete);


// Create a new booking
app.post('/create-booking', userAuthentication, bookingController.createBooking)

// Get all bookings (admin only)
app.get('/admin/bookings', userAuthentication, userAuthorization(['admin']), bookingController.getAllBookings)

// Get bookings by mentor ID
app.get('/list-bookingsByMentorId/:mentorId', userAuthentication, bookingController.getBookingsByMentorId)

// Get bookings by student ID  
app.get('/list-bookingsByStudentId/:studentId', userAuthentication, bookingController.getBookingsByStudentId)

// Get current user's bookings
app.get('/my-bookings', userAuthentication, bookingController.getMyBookings)

app.put('/bookings/:id/status', userAuthentication, bookingController.updateBookingStatus);

app.post('/reschedule-session', userAuthentication, bookingController.rescheduleSession)

// Analytics Routes
// These routes match the frontend MentorAnalyticsDashboard component

// Basic comprehensive analytics
app.get('/analytics/mentor/:mentorId', userAuthentication, analyticsController.getMentorAnalytics);

// Monthly analytics for a specific year
app.get('/analytics/mentor/:mentorId/monthly', userAuthentication, analyticsController.getMentorMonthlyAnalytics);

// Daily analytics for a specific month  
app.get('/analytics/mentor/:mentorId/daily', userAuthentication, analyticsController.getMentorDailyAnalytics);

// Top performing sessions/topics
app.get('/analytics/mentor/:mentorId/top-sessions', userAuthentication, analyticsController.getTopPerformingSessions);

// Booking time analytics (MISSING)
app.get('/analytics/mentor/:mentorId/booking-time', userAuthentication, analyticsController.getBookingTimeAnalytics);

// Cancellation analytics (MISSING)
app.get('/analytics/mentor/:mentorId/cancellations', userAuthentication, analyticsController.getCancellationAnalytics);

// for session
app.get('/list-sessions',userAuthentication,sessionController.list)
app.get('/list-sessionsById/:id',sessionController.listSessionById)
app.get('/list-sessionsByStudentId/:id',sessionController.listStudentSessionById)
app.post('/add-session/:id',userAuthentication,userAuthorization(['mentor']),checkSchema(sessionValidationSchema),sessionController.create)
app.post('/update-session/:id',userAuthentication,userAuthorization(['mentor','student']),checkSchema(sessionValidationSchema),sessionController.update)
app.put('/cancel-session/:id',userAuthentication,userAuthorization(['mentor','student']),checkSchema(sessionValidationSchema),sessionController.cancel)
app.delete('/delete-session/:id',userAuthentication,userAuthorization(['mentor','student']),sessionController.cancel)

// for review
app.get('/reviews',reviewController.list)
app.post('/create-reviews/:id',userAuthentication,userAuthorization(['student']),checkSchema(reviewValidationSchema),reviewController.create)
app.put('/update-reviews/:id',userAuthentication,userAuthorization(['student']),checkSchema(reviewUpdateValidationSchema),reviewController.update)
app.delete('/delete-reviews/:id',userAuthentication,userAuthorization(['student']),reviewController.delete)

// for category
app.get('/categories',userAuthentication,checkSchema(categoryValidationSchema),categoryController.list)
app.post('/category',userAuthentication,userAuthorization(['admin']),checkSchema(categoryValidationSchema),categoryController.create)
app.put('/update-category/:id',userAuthentication,userAuthorization(['admin']),checkSchema(categoryValidationSchema),categoryController.update)
app.get('/category/:id',userAuthentication,userAuthorization(['admin']),categoryController.getCategory)
app.delete('/delete-category/:id',userAuthentication,userAuthorization(['admin']),categoryController.delete)

// for payment
app.post('/rjpayment',paymentController.create)
app.get('/payments',paymentController.list)

// otpController
app.post('/sendOtp',OTPController.sendOtp)
app.post('/verifyOtp',OTPController.verify)

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})