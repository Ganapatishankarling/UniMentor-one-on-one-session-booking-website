import AvailabilityModel from '../models/AvailabilityModel.js';
import User from '../models/UserModel.js';

export const availabilityValidationSchema = {
    // For createOrUpdate endpoint
    bookingPeriod: {
        in: ['body'],
        optional: true,
        isInt: {
            options: { min: 1, max: 12 },
            errorMessage: 'Booking period must be between 1 and 12 months'
        },
        toInt: true
    },
    noticePeriod: {
        in: ['body'],
        optional: true,
        isInt: {
            options: { min: 1, max: 72 },
            errorMessage: 'Notice period must be between 1 and 72 hours'
        },
        toInt: true
    },
    // reschedulePolicy: {
    //     in: ['body'],
    //     optional: true,
    //     isIn: {
    //         options: [['direct', 'approval_required', 'no_reschedule']],
    //         errorMessage: 'Reschedule policy must be one of: direct, approval_required, no_reschedule'
    //     }
    // },
    // rescheduleTimeframe: {
    //     in: ['body'],
    //     optional: true,
    //     isIn: {
    //         options: [['1', '3', '6', '12', '24', '48', '72']],
    //         errorMessage: 'Reschedule timeframe must be one of: 1, 3, 6, 12, 24, 48, 72 hours'
    //     }
    // },

    // 'weeklySchedule.*.enabled': {
    //     in: ['body'],
    //     optional: true,
    //     isBoolean: {
    //         errorMessage: 'Schedule enabled field must be a boolean'
    //     },
    //     toBoolean: true
    // },
    // 'weeklySchedule.*.timeSlots': {
    //     in: ['body'],
    //     optional: true,
    //     isArray: {
    //         errorMessage: 'Time slots must be an array'
    //     },
    //     custom: {
    //         options: (value) => {
    //             if (!Array.isArray(value)) return true; // Will be caught by isArray
                
    //             for (const slot of value) {
    //                 if (!slot.slotTime || typeof slot.slotTime !== 'string') {
    //                     throw new Error('Each time slot must have a slotTime field');
    //                 }
                    
    //                 // Validate 24-hour format HH:MM
    //                 if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.slotTime)) {
    //                     throw new Error('Invalid time format. Use HH:MM format (24-hour)');
    //                 }
                    
    //                 // Validate boolean fields
    //                 if (slot.isAvailable !== undefined && typeof slot.isAvailable !== 'boolean') {
    //                     throw new Error('isAvailable must be a boolean');
    //                 }
    //             }
    //             return true;
    //         }
    //     }
    // },
    blockedDates: {
        in: ['body'],
        optional: true,
        isArray: {
            errorMessage: 'Blocked dates must be an array'
        },
        custom: {
            options: (value) => {
                if (!Array.isArray(value)) return true; // Will be caught by isArray
                
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                for (const date of value) {
                    if (!dateRegex.test(date)) {
                        throw new Error(`Invalid date format: ${date}. Use YYYY-MM-DD format`);
                    }
                    
                    // Validate it's a real date
                    const dateObj = new Date(date);
                    if (dateObj.toISOString().split('T')[0] !== date) {
                        throw new Error(`Invalid date: ${date}`);
                    }
                }
                return true;
            }
        }
    }
};

// Validation schema for updateDaySchedule endpoint
export const dayScheduleValidationSchema = {
    day: {
        in: ['params'],
        exists: {
            errorMessage: 'Day parameter is required'
        },
        isIn: {
            options: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']],
            errorMessage: 'Invalid day specified'
        },
        toLowerCase: true
    },
    enabled: {
        in: ['body'],
        optional: true,
        isBoolean: {
            errorMessage: 'Enabled field must be a boolean'
        },
        toBoolean: true
    },
    timeSlots: {
        in: ['body'],
        optional: true,
        isArray: {
            errorMessage: 'Time slots must be an array'
        },
        custom: {
            options: (value) => {
                if (!Array.isArray(value)) return true;
                
                for (const slot of value) {
                    if (!slot.slotTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.slotTime)) {
                        throw new Error('Invalid time format. Use HH:MM format (24-hour)');
                    }
                }
                return true;
            }
        }
    }
};

// Validation schema for blocked dates operations
export const blockedDatesManagementValidationSchema = {
    action: {
        in: ['body'],
        exists: {
            errorMessage: 'action field is required'
        },
        isIn: {
            options: [['add', 'remove']],
            errorMessage: 'action must be either "add" or "remove"'
        }
    },
    dates: {
        in: ['body'],
        exists: {
            errorMessage: 'dates field is required'
        },
        isArray: {
            options: { min: 1 },
            errorMessage: 'Dates must be a non-empty array'
        },
        custom: {
            options: async (value, { req }) => {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                const { action } = req.body;
                
                // Get user and availability for business logic validation
                const user = await User.findById(req.userId);
                if (!user) {
                    throw new Error('User not found');
                }
                
                const availability = await AvailabilityModel.findOne({ mentorId: user._id });
                if (!availability && action === 'remove') {
                    throw new Error('Availability not found');
                }
                
                for (const date of value) {
                    if (!dateRegex.test(date)) {
                        throw new Error(`Invalid date format: ${date}. Use YYYY-MM-DD format`);
                    }
                    
                    // Validate it's a real date
                    const dateObj = new Date(date);
                    if (dateObj.toISOString().split('T')[0] !== date) {
                        throw new Error(`Invalid date: ${date}`);
                    }
                    
                    // Check if date is in the past (only for add action)
                    if (action === 'add') {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (dateObj < today) {
                            throw new Error(`Cannot block past date: ${date}`);
                        }
                    }
                    
                    // For remove action, check if date is actually blocked
                    if (action === 'remove' && availability) {
                        if (!availability.blockedDates.includes(date)) {
                            throw new Error(`Date ${date} is not currently blocked`);
                        }
                    }
                }
                
                // For add action, check if all dates are already blocked
                if (action === 'add' && availability) {
                    const existingDates = new Set(availability.blockedDates);
                    const newDates = value.filter(date => !existingDates.has(date));
                    if (newDates.length === 0) {
                        throw new Error('All dates are already blocked');
                    }
                }
                
                return true;
            }
        }
    }
};
// Validation schema for booking/releasing slots
export const slotOperationValidationSchema = {
    mentorId: {
        in: ['body'],
        exists: {
            errorMessage: 'mentorId field is required'
        },
        isMongoId: {
            errorMessage: 'mentorId must be a valid MongoDB ObjectId'
        },
        custom: {
            options: async (value) => {
                const mentor = await User.findById(value);
                if (!mentor) {
                    throw new Error('Mentor not found');
                }
                if (mentor.role !== 'mentor') {
                    throw new Error('User is not a mentor');
                }
                return true;
            }
        }
    },
    day: {
        in: ['body'],
        exists: {
            errorMessage: 'day field is required'
        },
        isIn: {
            options: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']],
            errorMessage: 'Invalid day specified'
        },
        toLowerCase: true
    },
    slotIndex: {
        in: ['body'],
        exists: {
            errorMessage: 'slotIndex field is required'
        },
        isInt: {
            options: { min: 0 },
            errorMessage: 'slotIndex must be a non-negative integer'
        },
        toInt: true,
        custom: {
            options: async (value, { req }) => {
                const { mentorId, day } = req.body;
                
                const availability = await AvailabilityModel.findOne({ mentorId });
                if (!availability) {
                    throw new Error('Mentor availability not found');
                }
                
                const daySchedule = availability.weeklySchedule[day.toLowerCase()];
                if (!daySchedule) {
                    throw new Error('Day schedule not found');
                }
                
                if (value >= daySchedule.timeSlots.length) {
                    throw new Error('Invalid slot index');
                }
                
                return true;
            }
        }
    },
    sessionId: {
        in: ['body'],
        optional: true,
        isMongoId: {
            errorMessage: 'sessionId must be a valid MongoDB ObjectId'
        }
    }
};

// Validation schema for checking slot availability
export const checkSlotValidationSchema = {
    mentorId: {
        in: ['params'],
        exists: {
            errorMessage: 'mentorId parameter is required'
        },
        isMongoId: {
            errorMessage: 'mentorId must be a valid MongoDB ObjectId'
        }
    },
    day: {
        in: ['params'],
        exists: {
            errorMessage: 'day parameter is required'
        },
        isIn: {
            options: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']],
            errorMessage: 'Invalid day specified'
        },
        toLowerCase: true
    },
    slotIndex: {
        in: ['params'],
        exists: {
            errorMessage: 'slotIndex parameter is required'
        },
        isInt: {
            options: { min: 0 },
            errorMessage: 'slotIndex must be a non-negative integer'
        },
        toInt: true
    }
};

// Validation schema for getting available slots
export const availableSlotsValidationSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'mentor id parameter is required'
        },
        isMongoId: {
            errorMessage: 'mentor id must be a valid MongoDB ObjectId'
        }
    },
    startDate: {
        in: ['query'],
        optional: true,
        matches: {
            options: /^\d{4}-\d{2}-\d{2}$/,
            errorMessage: 'startDate must be in YYYY-MM-DD format'
        }
    },
    endDate: {
        in: ['query'],
        optional: true,
        matches: {
            options: /^\d{4}-\d{2}-\d{2}$/,
            errorMessage: 'endDate must be in YYYY-MM-DD format'
        },
        custom: {
            options: (value, { req }) => {
                if (req.query.startDate && value) {
                    const start = new Date(req.query.startDate);
                    const end = new Date(value);
                    if (end <= start) {
                        throw new Error('endDate must be after startDate');
                    }
                }
                return true;
            }
        }
    }
};

// Role-based validation middleware
export const mentorOnlyValidation = {
    custom: {
        options: async (value, { req }) => {
            if (req.role !== 'mentor') {
                throw new Error('Only mentors can access this resource');
            }
            return true;
        }
    }
};

// User existence validation
export const userExistsValidation = {
    custom: {
        options: async (value, { req }) => {
            const user = await User.findById(req.userId);
            if (!user) {
                throw new Error('User not found');
            }
            return true;
        }
    }
};