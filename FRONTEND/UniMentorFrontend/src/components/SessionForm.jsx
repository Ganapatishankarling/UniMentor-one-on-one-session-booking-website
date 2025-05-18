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

    return(
        <div className="max -w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
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
                        />
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
                        placeholder="Enter Session Fee"/>
                        <p className="text-gray-500 text-xs mt-1">You can add or update this later</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        disabled={loading}>{loading ? 'Creating...' : 'Create Session'}</button>
                    </div>
                </form>
        </div>
    )
}