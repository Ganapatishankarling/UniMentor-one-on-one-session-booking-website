import React,{useState} from 'react'
import axios from '../config/axios.jsx'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function AvailabilityForm(){
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        date:'',
        startTime:'',
        endTime:'',
        availabilityType:'recurring',
        daysOfWeek:[],
        slotduration:60,
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) =>{
        const {name,value} = e.target
        setFormData({...formData, [name]:value})
    }

    const handleDayToggle = (day) =>{
        const currentDays = [...formData.daysOfWeek]
        if(currentDays.includes(day)){
            setFormData({
                ...formData,
                daysOfWeek: currentDays.filter(day=>d !== day)
            })
        }else{
            setFormData({
                ...formData,
                daysOfWeek:[...currentDays, day]
            })
        }
    }

    const handleSubmit = async (e)=>{
        e.preventDefault()
        setLoading(true)
        try{
            const response = await axios.post('/set-availability',formData,{headers:{Authorization:localStorage.getItem('token')}})
            toast.success('Availability set successfully')
            navigate('/availability')
        }catch(err){
            console.log('Error setting availability',err)
            toast.error(err.response?.errors || 'Failed to set availability')
        }finally{
            setLoading(false)
        }
    }

    const today = new Date()

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Set Your Availability
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Availability Type:
                    </label>
                    <div className="flex space-x-4">
                        <label>
                            <input
                            type="radio"
                                name="availabilityType"
                                value="recurring"
                                checked={formData.availabilityType === 'recurring'}
                                onChange={handleChange}
                                className="mr-2"
                                />
                                <span>Recurring Weekly</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="availabilityType"
                                value="oneTime"
                                checked={formData.availabilityType === 'oneTime'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span>One-time</span>
                        </label>
                    </div>
                </div>

                {formData.availabilityType === 'oneTime' && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Date:
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={today.toISOString().split('T')[0]}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required={formData.availabilityType === 'oneTime'}
                        />
                    </div>
                )}

                {formData.availabilityType === 'recurring' && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Days of Week:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day.toLowerCase())}
                                    className={`px-3 py-1 rounded ${
                                        formData.daysOfWeek.includes(day.toLowerCase())
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {day.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                        {formData.daysOfWeek.length === 0 && (
                            <p className="text-red-500 text-xs mt-1">Please select at least one day</p>
                        )}
                    </div>
                )}

                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Start Time:
                        </label>
                        <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            End Time:
                        </label>
                        <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Session Duration (minutes):
                    </label>
                    <select
                        name="slotDuration"
                        value={formData.slotDuration}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        disabled={loading || (formData.availabilityType === 'recurring' && formData.daysOfWeek.length === 0)}
                    >
                        {loading ? 'Saving...' : 'Set Availability'}
                    </button>
                </div>
            </form>
        </div>
    )
}