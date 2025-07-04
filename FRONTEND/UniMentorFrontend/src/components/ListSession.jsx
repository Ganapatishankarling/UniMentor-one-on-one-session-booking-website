import React, { useState, useEffect } from 'react'
import axios from '../config/axios.jsx'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAccount } from '../slices/accountSlice.jsx';
import { Calendar, Clock, X, Check } from 'lucide-react'

export default function ListSession() {
    const dispatch = useDispatch();
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('upcoming')
    const [filter, setFilter] = useState('all')
    const [showRescheduleModal, setShowRescheduleModal] = useState(false)
    const [selectedSession, setSelectedSession] = useState(null)
    const [mentorAvailability, setMentorAvailability] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { data } = useSelector((state) => state.account);
      
    useEffect(() => {
        dispatch(fetchUserAccount());
    }, [dispatch]);

    const fetchSessions = async () => {
        try {
            const endpoint = data?.role === 'mentor' 
                ? `/list-bookingsByMentorId/${data?._id}`
                : `/list-bookingsByStudentId/${data?._id}` 
               
            const response = await axios.get(endpoint, {
                headers: { Authorization: localStorage.getItem('token') }
            })
            
            // Transform booking data to match session structure
            const transformedSessions = response.data.bookings?.map(booking => ({
                _id: booking._id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                topic: booking.topic,
                mentorId: booking.mentorId,
                studentId: booking.studentId,
                status: booking.status,
                meetingLink: booking.meetingLink,
                sessionId: booking.sessionId
            })) || []
            
            setSessions(transformedSessions)
        } catch (err) {
            console.log(err)
            toast.error('Failed to load sessions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSessions()
        }, 1000)
        return () => clearTimeout(timer)
    }, [data])
const cancelSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
        return
    }
    
    try {
        // Use the new endpoint for updating booking status
        await axios.put(`/bookings/${id}/status`, 
            { status: 'cancelled' },
            {
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: localStorage.getItem('token') 
                }
            }
        )
        fetchSessions()
        toast.success('Session cancelled successfully')
    } catch (err) {
        console.log('Error cancelling session', err)
        toast.error('Failed to cancel session')
    }
}

    const deleteSession = async (id) => {
        if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            return
        }
        
        try {
            await axios.delete(`/bookings/${id}`, {
                headers: { 
                    Authorization: localStorage.getItem('token') 
                }
            })
            fetchSessions()
            toast.success('Session deleted successfully')
        } catch (err) {
            console.log('Error deleting session', err)
            toast.error('Failed to delete session')
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString()
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A'
        
        // Handle different time formats
        let time = timeStr
        
        // If time is already in 12-hour format, return as is
        if (time.includes('AM') || time.includes('PM') || time.includes('am') || time.includes('pm')) {
            return time
        }
        
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours, 10)
        const minute = minutes || '00'
        
        if (hour === 0) {
            return `12:${minute} AM`
        } else if (hour < 12) {
            return `${hour}:${minute} AM`
        } else if (hour === 12) {
            return `12:${minute} PM`
        } else {
            return `${hour - 12}:${minute} PM`
        }
    }

const openRescheduleModal = async (session) => {
    setSelectedSession(session);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedSlotIndex(null);
    setShowRescheduleModal(true);
    
    // Fetch mentor availability
    const mentorId = data?.role === 'mentor' ? data._id : session.mentorId._id;
    await fetchMentorAvailability(mentorId);
};





const fetchMentorAvailability = async (mentorId) => {
    try {
        const response = await axios.get(`/availability/mentor/${mentorId}`);
        setMentorAvailability(response?.data);
    } catch (err) {
        console.error("Error fetching mentor availability:", err);
        toast.error("Failed to load mentor availability");
    }
};

const convertTo24Hour = (time12h) => {
    if (!time12h || typeof time12h !== 'string') return '00:00';
    
    if (/^\d{1,2}:\d{2}$/.test(time12h.trim()) && !time12h.includes(' ')) {
        const [hours, minutes] = time12h.trim().split(':');
        return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    const [time, modifier] = time12h.trim().split(' ');
    if (!time || !modifier) return '00:00';
    
    let [hours, minutes] = time.split(':');
    if (!hours || !minutes) return '00:00';
    
    let hour24 = parseInt(hours, 10);
    
    if (modifier.toUpperCase() === 'AM') {
        if (hour24 === 12) hour24 = 0;
    } else if (modifier.toUpperCase() === 'PM') {
        if (hour24 !== 12) hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

const convertTo12Hour = (time24) => {
    if (!time24) return "Time not available";
    
    if (time24.includes('AM') || time24.includes('PM')) {
        return time24;
    }
    
    let [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
};

const getStatusDisplay = (status) => {
    switch(status) {
        case 'pending':
            return { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'Pending' };
        case 'completed':
            return { bg: 'bg-green-200', text: 'text-green-800', label: 'Completed' };
        case 'cancelled':
            return { bg: 'bg-red-200', text: 'text-red-800', label: 'Cancelled' };
        case 'reschedule_pending':
            return { bg: 'bg-blue-200', text: 'text-blue-800', label: 'Reschedule Pending' };
        default:
            return { bg: 'bg-gray-200', text: 'text-gray-800', label: status };
    }
};

const formatDateForCalendar = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};



const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return days;
};

const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const now = new Date();
    const noticeHours = mentorAvailability?.noticePeriod || 3;
    const minBookingTime = new Date(now.getTime() + (noticeHours * 60 * 60 * 1000));
    if (date < minBookingTime) return false;
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = mentorAvailability?.weeklySchedule?.[dayName];
    
    return daySchedule?.timeSlots?.length > 0 && 
           daySchedule.timeSlots.some(slot => slot.isAvailable && !slot.isBooked);
};

const getAvailableTimeSlots = (date) => {
    if (!mentorAvailability || !mentorAvailability.weeklySchedule) {
        console.log('No mentor availability data');
        return [];
    }
    
    let dayName;
    let formattedDate;
    if (typeof date === 'string') {
        formattedDate = date;
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    } else {
        formattedDate = formatDateForCalendar(date);
        dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    }
    
    console.log('Getting slots for:', { dayName, formattedDate });
    
    const daySchedule = mentorAvailability.weeklySchedule[dayName];
    
    if (!daySchedule || !daySchedule.timeSlots) {
        console.log('No day schedule found for:', dayName);
        return [];
    }
    
    console.log('Day schedule timeSlots:', daySchedule.timeSlots);
    
    // Filter available slots and keep track of their original indices
    const availableSlots = daySchedule.timeSlots
        .map((slot, originalIndex) => ({ ...slot, originalIndex }))
        .filter((slot) => {
            const isGenerallyAvailable = slot.isAvailable;
            const isBookedForThisDate = slot.bookedDates && slot.bookedDates.includes(formattedDate);
            
            console.log(`Slot ${slot.originalIndex}:`, {
                startTime: slot.startTime,
                endTime: slot.endTime,
                isGenerallyAvailable,
                bookedDates: slot.bookedDates,
                isBookedForThisDate,
                shouldShow: isGenerallyAvailable && !isBookedForThisDate
            });
            
            return isGenerallyAvailable && !isBookedForThisDate;
        });
    
    console.log('Available slots after filtering:', availableSlots);
    return availableSlots;
};




const createRescheduleRequest = async (bookingId, requestData) => {
    try {
        const response = await fetch(`/bookings/${bookingId}/reschedule-request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating reschedule request:', error);
        throw error;
    }
};

const performDirectReschedule = async () => {
    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    const rescheduleData = {
        sessionId: selectedSession._id,
        newDate: selectedDate,
        newStartTime: convertTo24Hour(selectedTimeSlot.startTime),
        newEndTime: convertTo24Hour(selectedTimeSlot.endTime),
        newSlotIndex: selectedSlotIndex,
        newDay: dayName,
        mentorId: data?.role === 'mentor' ? data._id : selectedSession.mentorId._id
    };

    await axios.post('/reschedule-session', rescheduleData, {
        headers: { Authorization: localStorage.getItem('token') }
    });

    setShowRescheduleModal(false);
    fetchSessions();
    const mentorId = data?.role === 'mentor' ? data._id : selectedSession.mentorId._id;
    await fetchMentorAvailability(mentorId);
    toast.success("Session rescheduled successfully!");
};

    const isUpcoming = (session) => {
        const sessionDate = new Date(session.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return sessionDate >= today && session.status !== 'cancelled' && session.status !== 'completed'
    }

    const isPast = (session) => {
        const sessionDate = new Date(session.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return sessionDate < today || session.status === 'completed' || session.status === 'cancelled'
    }

    // 3. Update the canCancel function to handle reschedule_pending status
const canCancel = (session) => {
    return isUpcoming(session) && 
           (session.status === 'pending' || session.status === 'reschedule_pending');
};

const canReschedule = (session) => {
    return isUpcoming(session) && session.status === 'pending';
};
    const canDelete = (session) => {
        return session.status === 'completed' || session.status === 'cancelled'
    }

    const filteredSessions = sessions?.filter(session => {
        if (activeTab === 'upcoming') {
            return isUpcoming(session)
        } else if (activeTab === 'past') {
            return isPast(session)
        } else {
            if (filter === 'all') return true
            return session.status === filter
        }
    })

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>
    }

    const upcomingCount = sessions?.filter(s => isUpcoming(s)).length
    const pastCount = sessions?.filter(s => isPast(s)).length
    const allCount = sessions?.length

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Sessions</h2>
                {data?.role === 'mentor' && (
                    <div className="flex space-x-2">
                        <Link
                            to="/add-session"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Manual Session
                        </Link>
                    </div>
                )}
                {data?.role === 'student' && (
                    <Link
                        to="/mentors"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Book New Session
                    </Link>
                )}
            </div>

            <div className="mb-6 border-b">
                <button
                    className={`mr-4 py-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming ({upcomingCount})
                </button>
                <button
                    className={`mr-4 py-2 px-4 ${activeTab === 'past' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past Sessions ({pastCount})
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Sessions ({allCount})
                </button>
            </div>

            {activeTab === 'all' && (
                <div className="mb-4">
                    <label className="mr-2 font-medium">Filter:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded p-1"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="reschedule_pending">Reschedule Pending</option>
                    </select>
                </div>
            )}

            {filteredSessions.length === 0 ? (
                <p className="text-center text-gray-500 my-10">
                    No sessions found.
                    {data?.role === 'student' && (
                        <> <Link to="/mentors" className="text-blue-500 hover:underline">Book a session</Link> with a mentor to get started.</>
                    )}
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Date</th>
                                <th className="py-2 px-4 border-b text-left">Time</th>
                                <th className="py-2 px-4 border-b text-left">Topic</th>
                                <th className="py-2 px-4 border-b text-left">
                                    {data?.role === 'mentor' ? 'Student' : 'Mentor'}
                                </th>
                                <th className="py-2 px-4 border-b text-left">Status</th>
                                <th className="py-2 px-4 border-b text-left">Meeting Link</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map((session) => (
                                <tr key={session._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        {session?.date ? formatDate(session.date) : "-"}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                    </td>
                                    <td className="py-2 px-4 border-b">{session.topic || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">
                                        {data?.role === 'mentor' 
                                            ? session.studentId?.name || 'N/A'
                                            : session.mentorId?.name || 'N/A'
                                        }
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            session.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                            session.status === 'completed' ? 'bg-green-200 text-green-800' :
                                            'bg-red-200 text-red-800'
                                        }`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {session?.sessionId?.meetingLink ? (
                                            <a 
                                                style={{textDecoration:'underline', color:'blue'}} 
                                                href={session?.sessionId?.meetingLink} 
                                                target='_blank'
                                                rel="noopener noreferrer"
                                            >
                                                Join Meeting
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">No link</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
    {(() => {
        const statusInfo = getStatusDisplay(session.status);
        return (
            <span className={`px-2 py-1 rounded text-xs ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
            </span>
        );
    })()}
</td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex space-x-2">
                                            {canCancel(session) && (
                                                <button
                                                    onClick={() => cancelSession(session._id)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                                    title="Cancel Session"
                                                >
                                                    Cancel
                                                </button>
                                            )}
{canReschedule(session) && (
    <button
        onClick={() => openRescheduleModal(session)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        title="Reschedule Session"
    >
        Reschedule
    </button>
)}
                                            {canDelete(session) && (
                                                <button
                                                    onClick={() => deleteSession(session._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                    title="Delete Session"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            {!canCancel(session) && !canDelete(session) && (
                                                <span className="text-gray-400 text-sm">No actions</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
            )}
{showRescheduleModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Reschedule Session</h2>
                <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="text-white hover:text-indigo-200 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Select New Date</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ←
                                </button>
                                <span className="font-medium text-gray-700 min-w-[140px] text-center">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((date, index) => {
                                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                const isAvailable = isCurrentMonth && isDateAvailable(date);
                                const isSelected = selectedDate === formatDateForCalendar(date);
                                const isPast = date < new Date().setHours(0, 0, 0, 0);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (isAvailable) {
                                                setSelectedDate(formatDateForCalendar(date));
                                                setSelectedTimeSlot(null);
                                                setSelectedSlotIndex(null);
                                            }
                                        }}
                                        disabled={!isAvailable || isPast}
                                        className={`
                                            p-2 text-sm rounded-lg transition-colors
                                            ${isSelected 
                                                ? 'bg-indigo-600 text-white' 
                                                : isAvailable && !isPast
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                : isCurrentMonth && !isPast
                                                ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                                : 'text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                                <span>Available</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
                                <span>Not Available</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-indigo-600 rounded mr-1"></div>
                                <span>Selected</span>
                            </div>
                        </div>
                    </div>

                    {/* Time Slots Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h3>
                        
           {selectedDate ? (
    <div className="space-y-2">
        {getAvailableTimeSlots(new Date(selectedDate)).map((slot) => {
            const isBookedForSelectedDate = slot.bookedDates && slot.bookedDates.includes(selectedDate);
            return (
                <button
                    key={slot.originalIndex}
                    disabled={isBookedForSelectedDate}
                    type="button"
                    onClick={() => {
                        setSelectedTimeSlot(slot);
                        setSelectedSlotIndex(slot.originalIndex);
                        console.log('Selected slot:', {
                            originalIndex: slot.originalIndex,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            slot
                        });
                    }}
                    className={`
                        w-full p-3 text-left rounded-lg border transition-colors
                        ${selectedTimeSlot?.originalIndex === slot.originalIndex
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">
                            {convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)}
                        </span>
                        {selectedTimeSlot?.originalIndex === slot.originalIndex && 
                            <Check className="h-5 w-5 text-indigo-600" />
                        }
                    </div>
                </button>
            );
        })}
        
        {getAvailableTimeSlots(new Date(selectedDate)).length === 0 && (
            <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No time slots available for this date</p>
            </div>
        )}
    </div>
) : (
    <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>Please select a date first</p>
    </div>
)}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button
                        onClick={() => setShowRescheduleModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={performDirectReschedule}
                        disabled={!selectedDate || !selectedTimeSlot}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            selectedDate && selectedTimeSlot
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Confirm Reschedule
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
        
    )
}