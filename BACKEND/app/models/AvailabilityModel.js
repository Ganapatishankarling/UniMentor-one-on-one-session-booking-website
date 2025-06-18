import {Schema, model} from 'mongoose'

const AvailabilitySchema = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // or whatever your user model is called
        required: true,
        unique: true // Each mentor should have only one availability document
    },

    // how far in the future can students book
    bookingPeriod: {
        type: Number,
        required: true,
        default: 2, // months in advance
        min: 1,
        max: 12
    },

    noticePeriod: {
        type: Number,
        required: true,
        default: 3, // hours in advance
        min: 1,
        max: 72
    },
    
    // Reschedule Settings
    reschedulePolicy: {
        type: String,
        enum: ['direct', 'request'],
        default: 'direct'
    },
    
    rescheduleTimeframe: {
        type: String,
        default: '24', // hours before session, or 'anytime'
        validate: {
            validator: function(v) {
                return v === 'anytime' || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0);
            },
            message: 'Reschedule timeframe must be "anytime" or a valid number of hours'
        }
    },
    
    // Weekly Schedule with Slot Tracking
    weeklySchedule: {
        monday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            // Slot tracking array: 0 = free, 1 = booked
            // Index corresponds to timeSlots array index
            slotStatus: { type: [Number], default: [] }
        },
        tuesday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        },
        wednesday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        },
        thursday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        },
        friday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        },
        saturday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        },
        sunday: {
            timeSlots: [{
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                isAvailable: { type: Boolean, default: true },
                isBooked: { type: Boolean, default: false },
                sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null }
            }],
            slotStatus: { type: [Number], default: [] }
        }
    },
    
    // Blocked Dates
    blockedDates: [{
        type: String, // Format: 'YYYY-MM-DD'
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: 'Date must be in YYYY-MM-DD format'
        }
    }],
    
}, {timestamps: true});

// Middleware to sync slotStatus array with timeSlots
AvailabilitySchema.pre('save', function(next) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        if (this.weeklySchedule[day].timeSlots) {
            const slotsLength = this.weeklySchedule[day].timeSlots.length;
            
            // Initialize slotStatus array if it doesn't exist or has wrong length
            if (!this.weeklySchedule[day].slotStatus || 
                this.weeklySchedule[day].slotStatus.length !== slotsLength) {
                this.weeklySchedule[day].slotStatus = new Array(slotsLength).fill(0);
            }
            
            // Sync slotStatus with timeSlots booking status
            this.weeklySchedule[day].timeSlots.forEach((slot, index) => {
                this.weeklySchedule[day].slotStatus[index] = slot.isBooked ? 1 : 0;
            });
        }
    });
    
    next();
});

const AvailabilityModel = model('Availability', AvailabilitySchema);

export default AvailabilityModel