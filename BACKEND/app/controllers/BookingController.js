import { validationResult } from 'express-validator';
import BookingModel from '../models/BookingModel.js';
import User from '../models/UserModel.js';
import AvailabilityModel from '../models/AvailabilityModel.js';
import Session from '../models/SessionModel.js';

const bookingController = {};

// Create a new booking
bookingController.createBooking = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            mentorId,
            sessionId,
            startTime,
            endTime,
            meetingLink,
            topic,
            date,
            slotIndex,
            day
        } = req.body;

        const studentId = req.userId; // Assuming student is the one making the booking

        // Verify mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ errors: 'Mentor not found' });
        }

        // Verify student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ errors: 'Student not found' });
        }


        // Create the booking
        const booking = new BookingModel({
            mentorId,
            studentId,
            sessionId,
            startTime,
            endTime,
            meetingLink: meetingLink || '',
            topic: topic || '',
            date: new Date(date),
            day: day,           // Add this
            slotIndex: slotIndex
        });
        const updatePath = `weeklySchedule.${day.toLowerCase()}.timeSlots.${slotIndex}`;
                
                // UPDATED: Check if slot is available AND not booked for this specific date
                const updatedAvailability = await AvailabilityModel.findOneAndUpdate(
                    {
                        mentorId,
                        [`${updatePath}.isAvailable`]: true,
                        [`${updatePath}.bookedDates`]: { $ne: date } // NOT booked for this date
                    },
                    {
                        $addToSet: {
                            [`${updatePath}.bookedDates`]: date // ADD date to bookedDates array
                        },
                        $set: {
                            [`${updatePath}.sessionId`]: sessionId
                        }
                    },
                    { new: true, runValidators: true }
                )
                        if (!updatedAvailability) {
            return res.status(400).json({ 
                errors: 'Slot is not available or already booked for this date' 
            });
        }

        await booking.save();

        
        const populatedBooking = await BookingModel.findById(booking._id)
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email');

        return res.status(201).json({
            message: 'Booking created successfully',
            booking: populatedBooking
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get all bookings (admin only)
bookingController.getAllBookings = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            startDate, 
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bookings with pagination
        const bookings = await BookingModel.find(filter)
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email')
            .populate('sessionId')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalBookings = await BookingModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / parseInt(limit));

        return res.json({
            bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBookings,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get bookings by student ID
bookingController.getBookingsByStudentId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const studentId = req.params.studentId;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            startDate, 
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Verify student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ errors: 'Student not found' });
        }

        // Build filter object
        const filter = { studentId };
        if (status) {
            filter.status = status;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bookings with populated data
        const bookings = await BookingModel.find(filter)
            .populate('mentorId', 'name email')
            .populate('sessionId', 'meetingLink topic startTime endTime date')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));
const now = new Date();

for (const booking of bookings) {
    console.log("bo");
    
    const bookingDateStr = booking.date.toISOString().split('T')[0]; // '2025-06-29'
    const endTimeStr = booking.endTime.padStart(5, '0'); // '09:00'
    const sessionEndDateTime = new Date(`${bookingDateStr}T${endTimeStr}:00Z`);

    if (now >= sessionEndDateTime && booking.status !== 'completed') {
        booking.status = 'completed';
        await booking.save();
    }
}

   
        const totalBookings = await BookingModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / parseInt(limit));

        return res.json({
            studentId,
            bookings: bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBookings,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get bookings by mentor ID
bookingController.getBookingsByMentorId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const mentorId = req.params.mentorId;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            startDate, 
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Verify mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ errors: 'Mentor not found' });
        }

        // Build filter object
        const filter = { mentorId };
        if (status) {
            filter.status = status;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bookings with pagination
      // In getBookingsByMentorId function:
const bookings = await BookingModel.find(filter)
    .populate('studentId', 'name email')
    .populate('sessionId', 'meetingLink topic startTime endTime date') // <- Add this
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const now = new Date();

for (const booking of bookings) {
    console.log("bo");
    
    const bookingDateStr = booking.date.toISOString().split('T')[0]; // '2025-06-29'
    const endTimeStr = booking.endTime.padStart(5, '0'); // '09:00'
    const sessionEndDateTime = new Date(`${bookingDateStr}T${endTimeStr}:00Z`);

    if (now >= sessionEndDateTime && booking.status !== 'completed') {
        booking.status = 'completed';
        await booking.save();
    }
}


        // Get total count for pagination
        const totalBookings = await BookingModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / parseInt(limit));

        return res.json({
            mentorId,
            bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBookings,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get current user's bookings (as mentor or student)
bookingController.getMyBookings = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.userId;
        const { 
            role = 'student', // 'mentor' or 'student'
            page = 1, 
            limit = 10, 
            status, 
            startDate, 
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object based on role
        const filter = {};
        if (role === 'mentor') {
            filter.mentorId = userId;
        } else {
            filter.studentId = userId;
        }

        if (status) {
            filter.status = status;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bookings with pagination
        const bookings = await BookingModel.find(filter)
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email')
            .populate('sessionId')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalBookings = await BookingModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / parseInt(limit));

        return res.json({
            role,
            bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBookings,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Add this method to your bookingController
// Updated method that updates both booking AND session status
bookingController.updateBookingStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }

        // If cancelling, release the slot in availability
        if (status === 'cancelled') {
            const updatePath = `weeklySchedule.${booking.day.toLowerCase()}.timeSlots.${booking.slotIndex}`;
            
            await AvailabilityModel.findOneAndUpdate(
                { mentorId: booking.mentorId },
                {
                    $pull: {
                        [`${updatePath}.bookedDates`]: booking.date.toISOString().split('T')[0]
                    }
                },
                { new: true }
            );
        }

        // Update booking status
        booking.status = status;
        await booking.save();

        // **FIX: Also update the corresponding session status**
        if (booking.sessionId) {
            await Session.findByIdAndUpdate(
                booking.sessionId, 
                { 
                    status: status,
                    updatedAt: new Date()
                },
                { new: true }
            );
        }

        const populatedBooking = await BookingModel.findById(booking._id)
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email')
            .populate('sessionId'); // Also populate session to verify update

        return res.json({
            message: 'Booking and session updated successfully',
            booking: populatedBooking
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Add this method to your bookingController object

bookingController.rescheduleSession = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            sessionId,
            newDate,
            newStartTime,
            newEndTime,
            newSlotIndex,
            newDay,
            mentorId
        } = req.body;

        // Find the existing booking
        const booking = await BookingModel.findById(sessionId);
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }

        // Release the old slot
        const oldUpdatePath = `weeklySchedule.${booking.day.toLowerCase()}.timeSlots.${booking.slotIndex}`;
        const oldDateStr = booking.date.toISOString().split('T')[0];
        
        await AvailabilityModel.findOneAndUpdate(
            { mentorId: booking.mentorId },
            {
                $pull: {
                    [`${oldUpdatePath}.bookedDates`]: oldDateStr
                }
            }
        );

        // Book the new slot
        const newUpdatePath = `weeklySchedule.${newDay.toLowerCase()}.timeSlots.${newSlotIndex}`;
        
        const updatedAvailability = await AvailabilityModel.findOneAndUpdate(
            {
                mentorId,
                [`${newUpdatePath}.isAvailable`]: true,
                [`${newUpdatePath}.bookedDates`]: { $ne: newDate }
            },
            {
                $addToSet: {
                    [`${newUpdatePath}.bookedDates`]: newDate
                }
            },
            { new: true }
        );

        if (!updatedAvailability) {
            return res.status(400).json({ 
                errors: 'New slot is not available or already booked for this date' 
            });
        }

        // Update the booking
        booking.date = new Date(newDate);
        booking.startTime = newStartTime;
        booking.endTime = newEndTime;
        booking.slotIndex = newSlotIndex;
        booking.day = newDay;
        booking.status = 'pending'; // Reset status if needed

        await booking.save();

        const populatedBooking = await BookingModel.findById(booking._id)
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email');

        return res.json({
            message: 'Session rescheduled successfully',
            booking: populatedBooking
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};
export default bookingController;