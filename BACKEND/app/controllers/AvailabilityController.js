import { validationResult } from 'express-validator';
import AvailabilityModel from '../models/AvailabilityModel.js';
import User from '../models/UserModel.js';

const availabilityController = {};

// Get availability by mentor ID (for public viewing)
availabilityController.getByMentorId = async (req, res) => {
    try {
        const mentorId = req.params.id;
        
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ errors: 'Mentor not found' });
        }
        
        const availability = await AvailabilityModel.findOne({ mentorId })
            .populate('mentorId', 'name email');
            
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        return res.json(availability);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get current user's availability (mentor only)
availabilityController.getMy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.userId);
        
        let availability = await AvailabilityModel.findOne({ mentorId: user._id })
            .populate('mentorId', 'name email');
            
        // Create default availability if none exists
        if (!availability) {
            availability = new AvailabilityModel({
                mentorId: user._id,
                bookingPeriod: 2,
                noticePeriod: 3,
                reschedulePolicy: 'direct',
                rescheduleTimeframe: '24'
            });
            await availability.save();
            availability = await AvailabilityModel.findById(availability._id)
                .populate('mentorId', 'name email');
        }
        
        return res.json(availability);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Create or update availability (mentor only)
availabilityController.createOrUpdate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await User.findById(req.userId);
        
        // Check if availability already exists
        let availability = await AvailabilityModel.findOne({ mentorId: user._id });
        
        if (availability) {
            // Update existing availability
            const updateData = { ...req.body };
            delete updateData.mentorId; // Prevent mentorId from being changed
            
            availability = await AvailabilityModel.findByIdAndUpdate(
                availability._id,
                updateData,
                { new: true, runValidators: true }
            ).populate('mentorId', 'name email');
            
            return res.json(availability);
        } else {
            // Create new availability
            availability = new AvailabilityModel({
                mentorId: user._id,
                ...req.body
            });
            
            await availability.save();
            availability = await AvailabilityModel.findById(availability._id)
                .populate('mentorId', 'name email');
                
            return res.status(201).json(availability);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Update specific day schedule
availabilityController.updateDaySchedule = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await User.findById(req.userId);
        const { day } = req.params;
        const { timeSlots } = req.body;
        
        const availability = await AvailabilityModel.findOne({ mentorId: user._id });
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        // Update the specific day
        const updatePath = `weeklySchedule.${day.toLowerCase()}`;
        const updateData = {};
        
        if (timeSlots) {
            updateData[`${updatePath}.timeSlots`] = timeSlots;
        }
        
        const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
            availability._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('mentorId', 'name email');
        
        return res.json(updatedAvailability);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// manage blocked dates
availabilityController.manageBlockedDates = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await User.findById(req.userId);
        const { action, dates } = req.body;
        
        const availability = await AvailabilityModel.findOne({ mentorId: user._id });
        let updatedAvailability;
        
        if (action === 'add') {
            // Filter out already existing dates (validation already checked this)
            const existingDates = new Set(availability.blockedDates);
            const newDates = dates.filter(date => !existingDates.has(date));
            
            updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
                availability._id,
                { $addToSet: { blockedDates: { $each: newDates } } },
                { new: true, runValidators: true }
            ).populate('mentorId', 'name email');
            
            return res.json({
                message: `Successfully added ${newDates.length} blocked date(s)`,
                addedDates: newDates,
                availability: updatedAvailability
            });
            
        } else if (action === 'remove') {
            updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
                availability._id,
                { $pullAll: { blockedDates: dates } },
                { new: true, runValidators: true }
            ).populate('mentorId', 'name email');
            
            return res.json({
                message: `Successfully removed ${dates.length} blocked date(s)`,
                removedDates: dates,
                availability: updatedAvailability
            });
        }
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Book a time slot (used when a session is created)
// In availabilityController.js - UPDATE this method
availabilityController.bookSlot = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { mentorId, day, slotIndex, sessionId, date } = req.body; // ADD date parameter
        
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
        ).populate('mentorId', 'name email');
        
        if (!updatedAvailability) {
            return res.status(400).json({ 
                errors: 'Slot is not available or already booked for this date' 
            });
        }
        
        return res.json({
            message: 'Slot booked successfully',
            availability: updatedAvailability
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Get available slots for a specific mentor and date range
availabilityController.getAvailableSlots = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const mentorId = req.params.id;
        const { startDate, endDate } = req.query;
        
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ errors: 'Mentor not found' });
        }
        
        const availability = await AvailabilityModel.findOne({ mentorId });
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        // Get current date/time for validation
        const now = new Date();
        const noticeHours = availability.noticePeriod;
        const minBookingTime = new Date(now.getTime() + (noticeHours * 60 * 60 * 1000));
        
        // Filter out booked slots and blocked dates
        const availableSlots = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const daySchedule = availability.weeklySchedule[day];
            if (daySchedule && daySchedule.timeSlots && daySchedule.timeSlots.length > 0) {
                availableSlots[day] = {
                    timeSlots: daySchedule.timeSlots
                        .map((slot, index) => ({
                            index,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            isAvailable: slot.isAvailable && !slot.isBooked,
                            isBooked: slot.isBooked
                        }))
                        .filter(slot => slot.isAvailable) // Only return available slots
                };
            }
        });
        
        return res.json({
            mentorId,
            availableSlots,
            blockedDates: availability.blockedDates,
            bookingPeriod: availability.bookingPeriod,
            noticePeriod: availability.noticePeriod,
            minBookingTime: minBookingTime.toISOString()
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// In availabilityController.js - UPDATE this method
availabilityController.releaseSlot = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { mentorId, day, slotIndex, date } = req.body; // ADD date parameter
        
        const availability = await AvailabilityModel.findOne({ mentorId });
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        const updatePath = `weeklySchedule.${day.toLowerCase()}.timeSlots.${slotIndex}`;
        
        // UPDATED: Remove specific date from bookedDates array
        const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
            availability._id,
            {
                $pull: {
                    [`${updatePath}.bookedDates`]: date // REMOVE date from array
                },
                $set: {
                    [`${updatePath}.sessionId`]: null
                }
            },
            { new: true, runValidators: true }
        );
        
        return res.json(updatedAvailability);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Check if a specific slot is available for booking
availabilityController.checkSlotAvailability = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { mentorId, day, slotIndex } = req.params;
        
        const availability = await AvailabilityModel.findOne({ mentorId });
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        const daySchedule = availability.weeklySchedule[day.toLowerCase()];
        if (!daySchedule || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
            return res.json({ 
                available: false, 
                reason: 'No time slots available for this day' 
            });
        }
        
        const slot = daySchedule.timeSlots[slotIndex];
        if (!slot) {
            return res.json({ 
                available: false, 
                reason: 'Slot index does not exist' 
            });
        }
        
        const isAvailable = slot.isAvailable && !slot.isBooked;
        
        return res.json({
            available: isAvailable,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
            reason: !isAvailable ? (slot.isBooked ? 'Slot already booked' : 'Slot not available') : null
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Delete availability (mentor only)
availabilityController.delete = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.userId);
        
        const availability = await AvailabilityModel.findOne({ mentorId: user._id });
        if (!availability) {
            return res.status(404).json({ errors: 'Availability not found' });
        }
        
        // Check if there are any booked slots
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const hasBookedSlots = days.some(day => {
            const daySchedule = availability.weeklySchedule[day];
            return daySchedule?.timeSlots?.some(slot => slot.isBooked);
        });
        
        if (hasBookedSlots) {
            return res.status(400).json({ 
                errors: 'Cannot delete availability with booked sessions. Cancel all sessions first.' 
            });
        }
        
        await AvailabilityModel.findByIdAndDelete(availability._id);
        return res.json({ message: 'Availability deleted successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};

export default availabilityController;