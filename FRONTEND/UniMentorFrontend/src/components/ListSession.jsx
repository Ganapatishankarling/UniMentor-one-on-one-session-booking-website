import React, { useState, useEffect } from 'react'
import axios from '../config/axios.jsx'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAccount } from '../slices/accountSlice.jsx';

export default function ListSession() {
    const dispatch = useDispatch();
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('upcoming')
    const [filter, setFilter] = useState('all')
    const { data } = useSelector((state) => state.account);
      
    useEffect(() => {
        dispatch(fetchUserAccount());
    }, [dispatch]);

    const fetchSessions = async () => {
        try {
            const endpoint = data?.role === 'mentor' 
                ? `/list-sessionsById/${data?._id}`
                : `/list-sessionsByStudentId/${data?._id}` 
               
            const response = await axios.get(endpoint, {
                headers: { Authorization: localStorage.getItem('token') }
            })
            
            setSessions(response.data)
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
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Date</th>
                                <th className="py-2 px-4 border-b text-left">Time</th>
                                <th className="py-2 px-4 border-b text-left">Topic</th>
                                <th className="py-2 px-4 border-b text-left">Mentor</th>
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
                                        {session.startTime} - {session.endTime}
                                    </td>
                                    <td className="py-2 px-4 border-b">{session.topic || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">
                                        {session.mentorId.name}
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
        </div>
    )
}