import React,{useState,useEffect} from 'react'
import axios from '../config/axios.jsx'
import {useNavigate, useParams} from 'react-router-dom'
import {toast} from 'react-toastify'

export default function BookingForm(){
    const navigate = useNavigate()
    const { mentorId } = useParams()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [topic, setTopic] = useState('')
    const [availableDates, setAvailableDates] = useState([])
    const [availableSlots, setAvailableSlots] = useState([])
    const [mentorName, setMentorName] = useState('')

    useEffect(()=>{
        const fetchAvailableDates = async ()=>{
            try{
                const response = await axios.get(`/mentor/${mentorId}/available-dates`,{headers:{Authorization:localStorage.getItem('token')}})
                setAvailableDates(response.data.availableDates)
                setMentorName(response.data.mentorName)
                setLoading(false)
            }catch(err){
                toast.error('Failed to load available dates')
                setLoading(false)
            }
        }
        fetchAvailableDates()
    },[mentorId,token])

    useEffect(()=>{
        if(!selectedDate) return

        const fetchAvailableSlots = async()=>{
            try{
                const response = await axios.get(`/mentor/${mentorId}/available-slots`,{ params:{date:selectedDate},headers:{Authorization:localStorage.getItem('token')}})
                setAvailableSlots(response.data.availableSlots)
            }catch(err){
                toast.error('Failed to load available time slots')
            }
        }
        fetchAvailableSlots()
    },[selectedDate,mentorId,token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedSlot) {
            toast.error('Please select a time slot')
            return
        }
        
        setSubmitting(true)
        try {
            const bookingData = {
                mentorId,
                date: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                topic
            }
            
            await axios.post('/book-session', bookingData, 
                { headers: { 'Content-Type': 'application/json', Authorization: token } }
            )
            
            toast.success('Session booked successfully')
            navigate('/my-sessions')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book session')
        } finally {
            setSubmitting(false)
        }
    }
    
    const formatDate = (dateStr) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' }
        return new Date(dateStr).toLocaleDateString(undefined, options)
    }
    
    if (loading) {
        return <div className="text-center mt-10">Loading...</div>
    }
    
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold mb-2 text-center">Book a Session</h2>
            <p className="text-center text-gray-600 mb-6">with {mentorName}</p>
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Select Date:
                    </label>
                    {availableDates.length === 0 ? (
                        <p className="text-red-500">No available dates in the next 14 days</p>
                    ) : (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {availableDates.map(date => (
                                <button
                                    key={date}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(date)
                                        setSelectedSlot(null)
                                    }}
                                    className={`px-3 py-2 rounded ${
                                        selectedDate === date
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {formatDate(date)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {selectedDate && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Select Time Slot:
                        </label>
                        {availableSlots.length === 0 ? (
                            <p className="text-red-500">No available time slots for this date</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {availableSlots.map((slot, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-3 py-2 rounded text-center ${
                                            selectedSlot && selectedSlot.startTime === slot.startTime
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {slot.startTime} - {slot.endTime}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Topic (optional):
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="E.g., JavaScript Basics, Career Guidance"
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        disabled={submitting || !selectedSlot}
                    >
                        {submitting ? 'Booking...' : 'Book Session'}
                    </button>
                </div>
            </form>
        </div>
    )
}