import React,{useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import { useNavigate,useParams } from 'react-router-dom'
import { fetchUserAccount } from '../slices/accountSlice.jsx'
import { listCategories } from '../slices/categorySlice.jsx'
import { AlertTriangle, Briefcase, Edit, Loader2, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import axios from '../config/axios.jsx'

export default function Profile(){
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {id} = useParams()
    const {loading,serverError,data:account} = useSelector((state)=>state.account)
    const { user, loading: userLoading } = useSelector((state) => state.users)
    const { categories } = useSelector((state)=> state.categories)
    const [isActive,setIsActive] = useState(account?.mentorIshAvailability)

    useEffect(()=>{
        dispatch(fetchUserAccount())
        dispatch(listCategories())
    },[dispatch])

    const getCategoryName = (categoryId)=>{
      if(!categories || !categoryId) return 'Not set'
      const category = categories.find(cat => cat._id === categoryId)
      return category ? category.name : 'Not set'
    }
    useEffect(() => {
  if (account && typeof account.mentorIshAvailability === 'boolean') {
    setIsActive(account.mentorIshAvailability);
  }
}, [account]);
    const handleActivateMentor = (id,value) =>{
     try {
      const response = axios.patch(`mentorActivate/${id}`,{status:value},{headers:{Authorization:localStorage.getItem('token')}})
      console.log("resp",response);
       setIsActive(response?.mentorIshAvailability);
      
     } catch (error) {
         console.log(err)
     }
    }

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="mt-4 text-lg font-medium text-gray-700">Loading profile information...</p>
            </div>
          </div>
        </div>
      );
    }
  
    if (serverError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-md rounded-xl bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">Error Loading Profile</h2>
              <p className="mt-2 text-gray-600">{serverError.message}</p>
              <button 
              onClick={() => dispatch(fetchUserAccount())}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  
    if (!account) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-md rounded-xl bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center text-center">
              <User className="h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">No Account Data Available</h2>
              <p className="mt-2 text-gray-600">We couldn't find any profile information for this account.</p>
              <button 
              onClick={()=>navigate('/')}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }
  
    const RolesSpecificDetails = () => {
      if (account?.role === 'student') {
        return (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
            <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">Student Information</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">University</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{account.university || 'Not set'}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Education</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{account.education || 'Not set'}</p>
              </div>
            </div>
          </div>
        );
      } else if (account.role === 'mentor') {
        return (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
            <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">Mentor Information</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {/*  */}
 <div className="flex items-center space-x-4">
            <span className="text-gray-700">Activate Mentor</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isActive}
                onChange={(e) => handleActivateMentor(account._id, e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
            </label>
          </div>

              {/*  */}
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">University</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{account.university || 'Not set'}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Expertise Area</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{account.expertiseAreas || 'Not set'}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Experience(Years)</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{account.experience || 'Not set'}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Bio</p>
                <p className="mt-1 text-gray-900">{account.bio || 'Not set'}</p>
              </div>
              
            </div>
          </div>
        );
      }
      return null;
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <a href="/edit-profile" className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </a>
          </div>
  
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  {account.profileImage ? (
                    <img
                      src={account.profileImage}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
                      {account.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{account.name}</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{account.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{account.mobile || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Role</p>
                        <p className="text-sm font-medium capitalize text-indigo-600">{account.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">About</h3>
              <p className="mt-4 text-gray-700">
                {account?.bio || "No bio information provided."}
              </p>
            </div>
            <RolesSpecificDetails />
          </div>
        </div>
      </div>
    );
}