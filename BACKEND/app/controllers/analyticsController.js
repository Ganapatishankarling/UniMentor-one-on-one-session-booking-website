import { validationResult } from 'express-validator';
import PaymentModel from '../models/PaymentModel.js';
import SessionModel from '../models/SessionModel.js';
import BookingModel from '../models/BookingModel.js';
import mongoose from 'mongoose';

const analyticsController = {};

// Get mentor's comprehensive analytics
analyticsController.getMentorAnalytics = async (req, res) => {
    try {
        const { mentorId } = req.params;
        console.log(mentorId);
        
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        // Get all successful payments for this mentor
        const payments = await PaymentModel.find({
            mentorId: mentorId,
            paymentStatus: 'Success'
        }).sort({ createdAt: -1 });

        // Get all sessions for this mentor
        const sessions = await SessionModel.find({
            mentorId: mentorId
        }).sort({ createdAt: -1 });

        // Get all bookings for this mentor
        const bookings = await BookingModel.find({
            mentorId: mentorId
        }).sort({ createdAt: -1 });

        // Calculate total earnings
        const totalEarnings = payments.reduce((sum, payment) => {
            return sum + (parseFloat(payment.amount) || 0);
        }, 0);

        // Calculate session statistics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(session => session.status === 'completed').length;
        const pendingSessions = sessions.filter(session => session.status === 'pending').length;
        const cancelledSessions = sessions.filter(session => session.status === 'cancelled').length;

        // Calculate booking statistics
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed').length;
        const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
        const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled').length;
        const completedBookings = bookings.filter(booking => booking.status === 'completed').length;

        // Calculate booking-to-session conversion rate
        const conversionRate = totalBookings > 0 ? (completedSessions / totalBookings * 100) : 0;

        // Calculate monthly data for the last 12 months
        const monthlyData = getMonthlyAnalytics(payments, sessions, bookings);

        // Get recent transactions (last 10)
        const recentTransactions = payments.slice(0, 10).map(payment => ({
            id: payment._id,
            sessionId: payment.sessionId,
            studentId: payment.studentId,
            amount: payment.amount,
            currency: payment.currency,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            paymentMethod: payment.paymentMethod || 'Razorpay'
        }));

        // Calculate this month's data
        const currentMonth = new Date();
        const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const currentMonthPayments = payments.filter(payment => 
            new Date(payment.createdAt) >= currentMonthStart
        );
        const currentMonthSessions = sessions.filter(session => 
            new Date(session.createdAt) >= currentMonthStart
        );
        const currentMonthBookings = bookings.filter(booking => 
            new Date(booking.createdAt) >= currentMonthStart
        );

        const thisMonthEarnings = currentMonthPayments.reduce((sum, payment) => {
            return sum + (parseFloat(payment.amount) || 0);
        }, 0);

        // Calculate average session value
        const averageSessionValue = totalSessions > 0 ? totalEarnings / totalSessions : 0;

        // Calculate booking trends
        const bookingTrends = getBookingTrends(bookings);

        const analytics = {
            overview: {
                totalEarnings,
                totalSessions,
                totalBookings,
                completedSessions,
                pendingSessions,
                cancelledSessions,
                confirmedBookings,
                pendingBookings,
                cancelledBookings,
                completedBookings,
                averageSessionValue,
                conversionRate: Math.round(conversionRate * 100) / 100,
                thisMonthEarnings,
                thisMonthSessions: currentMonthSessions.length,
                thisMonthBookings: currentMonthBookings.length
            },
            monthlyData,
            recentTransactions,
            sessionStatusBreakdown: {
                completed: completedSessions,
                pending: pendingSessions,
                cancelled: cancelledSessions
            },
            bookingStatusBreakdown: {
                confirmed: confirmedBookings,
                pending: pendingBookings,
                cancelled: cancelledBookings,
                completed: completedBookings
            },
            bookingTrends
        };

        return res.json(analytics);

    } catch (err) {
        console.error('Error fetching mentor analytics:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching analytics' });
    }
};

// Get mentor's monthly analytics for a specific year
analyticsController.getMentorMonthlyAnalytics = async (req, res) => {
    try {
        const { mentorId } = req.params;
        let { year = new Date().getFullYear() } = req.query;
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        // Validate year
        year = parseInt(year);
        if (isNaN(year) || year < 2020 || year > new Date().getFullYear() + 1) {
            return res.status(400).json({ errors: 'Invalid year parameter' });
        }

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // Get data for the specified year
        const payments = await PaymentModel.find({
            mentorId: mentorId,
            paymentStatus: 'Success',
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const sessions = await SessionModel.find({
            mentorId: mentorId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const bookings = await BookingModel.find({
            mentorId: mentorId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const monthlyAnalytics = Array.from({ length: 12 }, (_, monthIndex) => {
            const monthStart = new Date(year, monthIndex, 1);
            const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);
            
            const monthPayments = payments.filter(payment => {
                const paymentDate = new Date(payment.createdAt);
                return paymentDate >= monthStart && paymentDate <= monthEnd;
            });

            const monthSessions = sessions.filter(session => {
                const sessionDate = new Date(session.createdAt);
                return sessionDate >= monthStart && sessionDate <= monthEnd;
            });

            const monthBookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= monthStart && bookingDate <= monthEnd;
            });

            const monthlyEarnings = monthPayments.reduce((sum, payment) => {
                return sum + (parseFloat(payment.amount) || 0);
            }, 0);

            const completedBookings = monthBookings.filter(b => b.status === 'completed').length;
            const cancelledBookings = monthBookings.filter(b => b.status === 'cancelled').length;
            const conversionRate = monthBookings.length > 0 ? (completedBookings / monthBookings.length * 100) : 0;

            return {
                month: monthStart.toLocaleDateString('en-US', { month: 'long' }),
                monthNumber: monthIndex + 1,
                year: parseInt(year),
                earnings: monthlyEarnings,
                sessions: monthSessions.length,
                bookings: monthBookings.length,
                completedSessions: monthSessions.filter(s => s.status === 'completed').length,
                completedBookings,
                cancelledBookings,
                conversionRate: Math.round(conversionRate * 100) / 100,
                transactions: monthPayments.length
            };
        });

        return res.json({
            year: parseInt(year),
            monthlyAnalytics,
            yearTotal: {
                earnings: monthlyAnalytics.reduce((sum, month) => sum + month.earnings, 0),
                sessions: monthlyAnalytics.reduce((sum, month) => sum + month.sessions, 0),
                bookings: monthlyAnalytics.reduce((sum, month) => sum + month.bookings, 0),
                transactions: monthlyAnalytics.reduce((sum, month) => sum + month.transactions, 0)
            }
        });

    } catch (err) {
        console.error('Error fetching monthly analytics:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching monthly analytics' });
    }
};

// Get mentor's daily analytics for a specific month
analyticsController.getMentorDailyAnalytics = async (req, res) => {
    try {
        const { mentorId } = req.params;
        let { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        // Validate parameters
        year = parseInt(year);
        month = parseInt(month);
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ errors: 'Invalid year or month parameter' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const daysInMonth = new Date(year, month, 0).getDate();

        // Get data for the specified month
        const payments = await PaymentModel.find({
            mentorId: mentorId,
            paymentStatus: 'Success',
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const sessions = await SessionModel.find({
            mentorId: mentorId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const bookings = await BookingModel.find({
            mentorId: mentorId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const dailyAnalytics = Array.from({ length: daysInMonth }, (_, dayIndex) => {
            const dayStart = new Date(year, month - 1, dayIndex + 1);
            const dayEnd = new Date(year, month - 1, dayIndex + 1, 23, 59, 59);
            
            const dayPayments = payments.filter(payment => {
                const paymentDate = new Date(payment.createdAt);
                return paymentDate >= dayStart && paymentDate <= dayEnd;
            });

            const daySessions = sessions.filter(session => {
                const sessionDate = new Date(session.createdAt);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });

            const dayBookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= dayStart && bookingDate <= dayEnd;
            });

            const dailyEarnings = dayPayments.reduce((sum, payment) => {
                return sum + (parseFloat(payment.amount) || 0);
            }, 0);

            return {
                date: dayStart.getDate(),
                fullDate: dayStart.toISOString().split('T')[0],
                dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                earnings: dailyEarnings,
                sessions: daySessions.length,
                bookings: dayBookings.length,
                transactions: dayPayments.length
            };
        });

        return res.json({
            year: parseInt(year),
            month: parseInt(month),
            monthName: startDate.toLocaleDateString('en-US', { month: 'long' }),
            dailyAnalytics,
            monthTotal: {
                earnings: dailyAnalytics.reduce((sum, day) => sum + day.earnings, 0),
                sessions: dailyAnalytics.reduce((sum, day) => sum + day.sessions, 0),
                bookings: dailyAnalytics.reduce((sum, day) => sum + day.bookings, 0),
                transactions: dailyAnalytics.reduce((sum, day) => sum + day.transactions, 0)
            }
        });

    } catch (err) {
        console.error('Error fetching daily analytics:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching daily analytics' });
    }
};

// Get top performing sessions/topics with booking data
analyticsController.getTopPerformingSessions = async (req, res) => {
    try {
        const { mentorId } = req.params;
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        // Aggregate sessions by topic with booking correlation
        const topSessions = await SessionModel.aggregate([
            {
                $match: {
                    mentorId: new mongoose.Types.ObjectId(mentorId),
                    topic: { $exists: true, $ne: null, $ne: "" }
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'sessionId',
                    as: 'bookingDetails'
                }
            },
            {
                $group: {
                    _id: '$topic',
                    sessionCount: { $sum: 1 },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalDuration: { $sum: '$duration' },
                    avgSessionFee: { $avg: { $toDouble: '$sessionFee' } },
                    bookingCount: { $sum: { $size: '$bookingDetails' } },
                    avgBookingsPerSession: { $avg: { $size: '$bookingDetails' } }
                }
            },
            {
                $sort: { sessionCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    topic: '$_id',
                    sessionCount: 1,
                    completedCount: 1,
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completedCount', '$sessionCount'] },
                            100
                        ]
                    },
                    avgDuration: { $divide: ['$totalDuration', '$sessionCount'] },
                    avgSessionFee: 1,
                    bookingCount: 1,
                    avgBookingsPerSession: 1,
                    _id: 0
                }
            }
        ]);

        return res.json(topSessions);

    } catch (err) {
        console.error('Error fetching top performing sessions:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching top sessions' });
    }
};

// Get booking analytics by day of week and time slots
analyticsController.getBookingTimeAnalytics = async (req, res) => {
    try {
        const { mentorId } = req.params;
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        const bookings = await BookingModel.find({
            mentorId: mentorId,
            startTime: { $exists: true, $ne: null }
        });

        // Analyze by day of week
        const dayAnalytics = {};
        const timeSlotAnalytics = {};
        
        bookings.forEach(booking => {
            // Day of week analysis
            const day = booking.day || new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dayAnalytics[day]) {
                dayAnalytics[day] = {
                    total: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0,
                    pending: 0
                };
            }
            dayAnalytics[day].total++;
            dayAnalytics[day][booking.status] = (dayAnalytics[day][booking.status] || 0) + 1;

            // Time slot analysis
            if (booking.startTime) {
                const hour = parseInt(booking.startTime.split(':')[0]);
                let timeSlot;
                
                if (hour >= 6 && hour < 12) timeSlot = 'Morning (6AM-12PM)';
                else if (hour >= 12 && hour < 17) timeSlot = 'Afternoon (12PM-5PM)';
                else if (hour >= 17 && hour < 21) timeSlot = 'Evening (5PM-9PM)';
                else timeSlot = 'Night (9PM-6AM)';
                
                if (!timeSlotAnalytics[timeSlot]) {
                    timeSlotAnalytics[timeSlot] = {
                        total: 0,
                        confirmed: 0,
                        completed: 0,
                        cancelled: 0,
                        pending: 0
                    };
                }
                timeSlotAnalytics[timeSlot].total++;
                timeSlotAnalytics[timeSlot][booking.status] = (timeSlotAnalytics[timeSlot][booking.status] || 0) + 1;
            }
        });

        return res.json({
            dayOfWeekAnalytics: dayAnalytics,
            timeSlotAnalytics: timeSlotAnalytics
        });

    } catch (err) {
        console.error('Error fetching booking time analytics:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching time analytics' });
    }
};

// Get cancellation analytics
analyticsController.getCancellationAnalytics = async (req, res) => {
    try {
        const { mentorId } = req.params;
        
        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({ errors: 'Invalid mentor ID' });
        }

        const bookings = await BookingModel.find({ mentorId });
        const sessions = await SessionModel.find({ mentorId });

        const totalBookings = bookings.length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

        const bookingCancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100) : 0;
        const sessionCancellationRate = sessions.length > 0 ? (cancelledSessions / sessions.length * 100) : 0;

        // Analyze cancellation patterns by day of week
        const cancellationByDay = {};
        const cancelledBookingsByDay = bookings.filter(b => b.status === 'cancelled');
        
        cancelledBookingsByDay.forEach(booking => {
            const day = booking.day || new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' });
            cancellationByDay[day] = (cancellationByDay[day] || 0) + 1;
        });

        // Recent cancellations (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCancellations = bookings.filter(b => 
            b.status === 'cancelled' && new Date(b.updatedAt) >= thirtyDaysAgo
        ).length;

        return res.json({
            bookingCancellationRate: Math.round(bookingCancellationRate * 100) / 100,
            sessionCancellationRate: Math.round(sessionCancellationRate * 100) / 100,
            totalCancelledBookings: cancelledBookings,
            totalCancelledSessions: cancelledSessions,
            cancellationByDay,
            recentCancellations,
            cancellationTrend: getCancellationTrend(bookings)
        });

    } catch (err) {
        console.error('Error fetching cancellation analytics:', err);
        return res.status(500).json({ errors: 'Something went wrong while fetching cancellation analytics' });
    }
};

// Helper function to calculate monthly analytics for the last 12 months (updated)
function getMonthlyAnalytics(payments, sessions, bookings) {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
        
        const monthPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= date && paymentDate < nextMonth;
        });

        const monthSessions = sessions.filter(session => {
            const sessionDate = new Date(session.createdAt);
            return sessionDate >= date && sessionDate < nextMonth;
        });

        const monthBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= date && bookingDate < nextMonth;
        });

        const monthlyEarnings = monthPayments.reduce((sum, payment) => {
            return sum + (parseFloat(payment.amount) || 0);
        }, 0);

        const completedBookings = monthBookings.filter(b => b.status === 'completed').length;
        const conversionRate = monthBookings.length > 0 ? (completedBookings / monthBookings.length * 100) : 0;

        monthlyData.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            monthName: date.toLocaleDateString('en-US', { month: 'long' }),
            year: date.getFullYear(),
            monthNumber: date.getMonth() + 1,
            earnings: monthlyEarnings,
            sessions: monthSessions.length,
            bookings: monthBookings.length,
            conversionRate: Math.round(conversionRate * 100) / 100,
            transactions: monthPayments.length
        });
    }
    
    return monthlyData;
}

// Helper function to get booking trends
function getBookingTrends(bookings) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    const recent30DayBookings = bookings.filter(b => new Date(b.createdAt) >= last30Days).length;
    const previous30DayBookings = bookings.filter(b => 
        new Date(b.createdAt) >= last60Days && new Date(b.createdAt) < last30Days
    ).length;
    
    const trend = previous30DayBookings > 0 
        ? ((recent30DayBookings - previous30DayBookings) / previous30DayBookings * 100)
        : (recent30DayBookings > 0 ? 100 : 0);
    
    return {
        last30Days: recent30DayBookings,
        previous30Days: previous30DayBookings,
        trendPercentage: Math.round(trend * 100) / 100,
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
}

// Helper function to get cancellation trend
function getCancellationTrend(bookings) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    const recent30DayCancellations = bookings.filter(b => 
        b.status === 'cancelled' && new Date(b.updatedAt) >= last30Days
    ).length;
    const previous30DayCancellations = bookings.filter(b => 
        b.status === 'cancelled' && 
        new Date(b.updatedAt) >= last60Days && 
        new Date(b.updatedAt) < last30Days
    ).length;
    
    const trend = previous30DayCancellations > 0 
        ? ((recent30DayCancellations - previous30DayCancellations) / previous30DayCancellations * 100)
        : (recent30DayCancellations > 0 ? 100 : 0);
    
    return {
        last30Days: recent30DayCancellations,
        previous30Days: previous30DayCancellations,
        trendPercentage: Math.round(trend * 100) / 100,
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
}

export default analyticsController;