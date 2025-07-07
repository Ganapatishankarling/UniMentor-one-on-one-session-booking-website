import React,{useEffect, useState} from 'react'
import axios from '../config/axios.jsx'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserAccount } from '../slices/accountSlice.jsx'

export default function SessionForm(){
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const token = localStorage.getItem('token')
    const [formData,setFormData] = useState({
        topic:'',
        meetingLink:'',
        duration:'',
        sessionFee:''
    })
    const [loading, setLoading] = useState(false)

    const { data } = useSelector((state) => state.account);
    useEffect(() => {
        dispatch(fetchUserAccount());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData,[name]:value})
    };

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setLoading(true)
        try{            
            const response = await axios.post(`/add-session/${data?._id}`,formData,{headers:{'Content-Type':'application/json',Authorization:token}})
            toast.success('Session creates successfully')
            navigate('/sessions')
        }catch(err){
            console.log('Error creating session',err)
            toast.error(err.response?.data?.errors || 'failed to create session')
        }finally{
            setLoading(false)
        }
    }

    const today = new Date()

    // Common duration options for quick selection
    const durationOptions = [
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '1 hour' },
        { value: '90', label: '1.5 hours' },
        { value: '120', label: '2 hours' },
    ];

    return(
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Manual Session</h2>
            <p className="mb-4 text-gray-600 text-center">
                Note: Students can book sessions based on your availability.
                Use this form only for creating specific manual sessions.
            </p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Topic:
                    </label>
                    <input 
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="E.g., JavaScript Basics, Career Guidance"
                    required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Session Duration:
                    </label>
                    <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="">Select duration</option>
                        {durationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    
                    {/* Custom duration input - shows when 'custom' is selected */}
                    {formData.duration === 'custom' && (
                        <div className="mt-2">
                            <input
                                type="number"
                                name="customDuration"
                                placeholder="Enter duration in minutes"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                min="30"
                                max="120"
                                onChange={(e) => {
                                    setFormData({...formData, duration: e.target.value});
                                }}
                            />
                            <p className="text-gray-500 text-xs mt-1">
                                Duration in minutes (30-120 minutes)
                            </p>
                        </div>
                    )}
                    
                    <p className="text-gray-500 text-xs mt-1">
                        Choose how long your session will be
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Meeting Link:
                    </label>
                    <input 
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://meet.google.com/..."/>
                    <p className="text-gray-500 text-xs mt-1">You can add or update this later</p>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Session Fee:
                    </label>
                    <input 
                    type="number"
                    name="sessionFee"
                    value={formData.sessionFee}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Session Fee"
                    min="0"
                    step="0.01"/>
                    <p className="text-gray-500 text-xs mt-1">You can add or update this later</p>
                </div>

                <div className="flex items-center justify-between">
                    <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    disabled={loading}>
                        {loading ? 'Creating...' : 'Create Session'}
                    </button>
                </div>
            </form>
        </div>
    )
}