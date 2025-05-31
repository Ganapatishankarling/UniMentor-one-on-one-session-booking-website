import React, { useState, useEffect } from 'react'
import axios from '../config/axios.jsx'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAccount } from '../slices/accountSlice.jsx';

export default function ListSession() {
    const dispatch = useDispatch();
    const [sessions, setSessions] = useState([])
    const [availability, setAvailability] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('upcoming')
    const [filter, setFilter] = useState('all')
    const [userRole, setUserRole] = useState('')
    const { data } = useSelector((state) => state.account);
    console.log("data",data?.role);
      
    useEffect(() => {
        dispatch(fetchUserAccount());
    }, [dispatch]);

    // Fetch availability settings for mentors
    const fetchAvailability = async () => {
        if (data?.role === 'mentor') {
            try {
                const response = await axios.get(`/get-availability/${data?._id}`, {
                    headers: { Authorization: localStorage.getItem('token') }
                })
                setAvailability(response.data)
            } catch (err) {
                console.log('Error fetching availability:', err)
                // Don't show error toast as availability might not be set yet
            }
        }
    }

    const fetchSessions = async () => {
        try {
            // Use different endpoints based on user role
            const endpoint = data?.role === 'mentor' 
                ? `/list-sessionsById/${data?._id}`
                : `/list-sessionsByStudentId/${data?._id}` 
               
            const response = await axios.get(endpoint, {
                headers: { Authorization: localStorage.getItem('token') }
            })
            console.log("res",response);
            
            setSessions(response.data)
        } catch (err) {
            console.log(err)
            toast.error('Failed to load sessions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(()=>{
            fetchSessions()
            fetchAvailability()
        },1000)
        return ()=>clearTimeout(timer)
    }, [data])

    const cancelSession = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) {
            return
        }
        
        try {
            await axios.put(`/cancel-session/${id}`, {}, {
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: localStorage.getItem('token') 
                }
            })
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
            await axios.delete(`/delete-session/${id}`, {
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

    // Check if reschedule is allowed based on availability settings
    const canReschedule = (session) => {
        if (!availability || !isUpcoming(session)) return false;
        
        const sessionDateTime = new Date(`${session.date}T${session.startTime}`)
        const now = new Date()
        const timeDifferenceHours = (sessionDateTime - now) / (1000 * 60 * 60)
        
        if (availability.rescheduleTimeframe === 'anytime') return true;
        
        const requiredHours = parseFloat(availability.rescheduleTimeframe)
        return timeDifferenceHours >= requiredHours
    }

    // Check if session date is blocked
    const isDateBlocked = (sessionDate) => {
        if (!availability || !availability.blockedDates) return false;
        return availability.blockedDates.includes(sessionDate)
    }

    // Get availability status for a specific day
    const getAvailabilityForDay = (date) => {
        if (!availability) return null;
        
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        return availability.weeklySchedule?.[dayName] || null
    }

    // Toggle availability for quick updates
    const toggleAvailability = async () => {
        try {
            await axios.put('/toggle-availability', {}, {
                headers: { Authorization: localStorage.getItem('token') }
            })
            fetchAvailability()
            toast.success('Availability updated successfully')
        } catch (err) {
            console.log('Error toggling availability:', err)
            toast.error('Failed to update availability')
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString()
    }

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

    const canCancel = (session) => {
        return isUpcoming(session) && (session.status === 'pending' || session.status === 'confirmed')
    }

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
                            to="/set-availability"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {availability ? 'Update Availability' : 'Set Availability'}
                        </Link>
                        <Link
                            to="/add-session"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Manual Session
                        </Link>
                        {availability && (
                            <button
                                onClick={toggleAvailability}
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Quick Toggle
                            </button>
                        )}
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

            {/* Availability Summary for Mentors */}
            {data?.role === 'mentor' && availability && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Availability Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Timezone:</span> {availability.timezone}
                        </div>
                        <div>
                            <span className="font-medium">Session Duration:</span> {availability.slotDuration} minutes
                        </div>
                        <div>
                            <span className="font-medium">Reschedule Policy:</span> {availability.reschedulePolicy === 'direct' ? 'Direct' : 'Request Approval'}
                        </div>
                        <div>
                            <span className="font-medium">Booking Period:</span> {availability.bookingPeriod} months
                        </div>
                        <div>
                            <span className="font-medium">Active Days:</span> {
                                Object.entries(availability.weeklySchedule || {})
                                    .filter(([day, schedule]) => schedule.enabled)
                                    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                                    .join(', ') || 'None'
                            }
                        </div>
                        <div>
                            <span className="font-medium">Blocked Dates:</span> {availability.blockedDates?.length || 0}
                        </div>
                    </div>
                </div>
            )}

            {/* Warning for mentors without availability */}
            {data?.role === 'mentor' && !availability && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-yellow-800">Availability Not Set</h4>
                            <p className="text-yellow-700 text-sm">Students cannot book sessions with you until you set your availability.</p>
                        </div>
                    </div>
                </div>
            )}

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
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            )}

            {filteredSessions.length === 0 ? (
                <p className="text-center text-gray-500 my-10">
                    No sessions found.
                    {data?.role === 'student' && (
                        <> <Link to="/mentors" className="text-blue-500 hover:underline">Book a session</Link> with a mentor to get started.</>
                    )}
                    {data?.role === 'mentor' && activeTab === 'upcoming' && (
                        <> <Link to="/set-availability" className="text-blue-500 hover:underline">Set your availability</Link> to allow students to book sessions with you.</>
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
                                {data?.role === 'mentor' ? (
                                    <th className="py-2 px-4 border-b text-left">Student</th>
                                ) : (
                                    <th className="py-2 px-4 border-b text-left">Mentor</th>
                                )}
                                <th className="py-2 px-4 border-b text-left">Status</th>
                                <th className="py-2 px-4 border-b text-left">Meeting Link</th>
                                {data?.role === 'mentor' && availability && (
                                    <th className="py-2 px-4 border-b text-left">Availability</th>
                                )}
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map((session) => {
                                const dayAvailability = getAvailabilityForDay(session.date)
                                const isBlocked = isDateBlocked(session.date)
                                const canRescheduleSession = canReschedule(session)
                                
                                return (
                                    <tr key={session._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">
                                            {session?.date ? formatDate(session.date) : "-"}
                                            {isBlocked && (
                                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                                    Blocked
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {session.startTime} - {session.endTime}
                                        </td>
                                        <td className="py-2 px-4 border-b">{session.topic || 'N/A'}</td>
                                        <td className="py-2 px-4 border-b">
                                            {data?.role === 'mentor' ? (
                                                session.studentName || 'Available'
                                            ) : (
                                                session.mentorName
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                session.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                session.status === 'confirmed' ? 'bg-blue-200 text-blue-800' :
                                                session.status === 'completed' ? 'bg-green-200 text-green-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {session?.meetingLink ? (
                                                <a 
                                                    style={{textDecoration:'underline', color:'blue'}} 
                                                    href={session.meetingLink} 
                                                    target='_blank'
                                                    rel="noopener noreferrer"
                                                >
                                                    Join Meeting
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">No link</span>
                                            )}
                                        </td>
                                        {data?.role === 'mentor' && availability && (
                                            <td className="py-2 px-4 border-b">
                                                {dayAvailability ? (
                                                    <div className="text-xs">
                                                        <div className={`px-2 py-1 rounded ${
                                                            dayAvailability.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {dayAvailability.enabled 
                                                                ? `${dayAvailability.startTime}-${dayAvailability.endTime}`
                                                                : 'Unavailable'
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No schedule</span>
                                                )}
                                            </td>
                                        )}
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
                                                {canRescheduleSession && data?.role === 'student' && (
                                                    <button
                                                        onClick={() => {/* Add reschedule logic */}}
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
                                                {!canCancel(session) && !canDelete(session) && !canRescheduleSession && (
                                                    <span className="text-gray-400 text-sm">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}