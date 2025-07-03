import { Schema, model } from 'mongoose';
const BookingSchema = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
    },
    
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
        required: true
    },
       
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    meetingLink:String,
     topic:{
        type:String
    },
    date:Date,
    day: {
        type: String,
        
    },
    slotIndex: {
        type: Number,
        
    }
}, { timestamps: true });
const BookingModel = model('Booking', BookingSchema);
export default BookingModel;