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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 via-pink-100 to-orange-100 p-6">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,92,246,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
          
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-violet-500 via-blue-500 via-cyan-500 to-emerald-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-transparent bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 bg-clip-text" />
                <div className="absolute inset-0 h-12 w-12 animate-spin">
                  <div className="h-full w-full rounded-full border-4 border-transparent bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 opacity-20"></div>
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold bg-gradient-to-r from-pink-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">Loading profile information...</p>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-violet-300 via-blue-300 to-cyan-300 rounded-2xl blur-lg opacity-30 -z-10"></div>
          </div>
        </div>
      );
    }
  
    if (serverError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 via-pink-100 to-orange-100 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,92,246,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="relative max-w-md rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 mb-4 shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">Error Loading Profile</h2>
              <p className="mt-2 text-gray-700 font-medium">{serverError.message}</p>
              <button 
              onClick={() => dispatch(fetchUserAccount())}
              className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-4 focus:ring-red-200 hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Try Again</span>
              </button>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 rounded-2xl blur-lg opacity-30 -z-10"></div>
          </div>
        </div>
      );
    }
  
    if (!account) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 via-pink-100 to-orange-100 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,92,246,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
          
          <div className="relative max-w-md rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600 rounded-t-2xl"></div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 mb-4 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-bold bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 bg-clip-text text-transparent">No Account Data Available</h2>
              <p className="mt-2 text-gray-700 font-medium">We couldn't find any profile information for this account.</p>
              <button 
              onClick={()=>navigate('/')}
              className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30 focus:outline-none focus:ring-4 focus:ring-violet-200 hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Go to Homepage</span>
              </button>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 rounded-2xl blur-lg opacity-30 -z-10"></div>
          </div>
        </div>
      );
    }
  
    const RolesSpecificDetails = () => {
      if (account?.role === 'student') {
        return (
          <div className="relative mt-8 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl"></div>
            <h3 className="border-b border-gradient-to-r from-emerald-200 to-cyan-200 pb-3 text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Student Information</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="relative group rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-60"></div>
                <p className="text-sm font-semibold text-emerald-700 mb-1">University</p>
                <p className="text-lg font-semibold text-gray-800">{account.university || 'Not set'}</p>
              </div>
              <div className="relative group rounded-xl bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 border border-teal-200 hover:border-teal-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 opacity-60"></div>
                <p className="text-sm font-semibold text-teal-700 mb-1">Education</p>
                <p className="text-lg font-semibold text-gray-800">{account.education || 'Not set'}</p>
              </div>
              <div className="relative group rounded-xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-4 border border-cyan-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-60"></div>
                <p className="text-sm font-semibold text-cyan-700 mb-1">Graduation Year</p>
                <p className="text-lg font-semibold text-gray-800">{account.graduationYear || 'Not set'}</p>
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 rounded-2xl blur-lg opacity-20 -z-10"></div>
          </div>
        );
      } else if (account.role === 'mentor') {
        return (
          <div className="relative mt-8 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-t-2xl"></div>
            <h3 className="border-b border-gradient-to-r from-purple-200 to-indigo-200 pb-3 text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Mentor Information</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Mentor Activation Toggle */}
              <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 border border-indigo-200">
                <span className="text-lg font-semibold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">Activate Mentor Status</span>
                <label className="relative inline-flex cursor-pointer items-center group">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isActive}
                    onChange={(e) => handleActivateMentor(account._id, e.target.checked)}
                  />
                  <div className="peer h-8 w-14 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 shadow-inner transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-7 after:w-7 after:rounded-full after:bg-white after:shadow-lg after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:via-emerald-500 peer-checked:to-teal-500 peer-checked:after:translate-x-6 group-hover:shadow-lg"></div>
                </label>
              </div>

              <div className="relative group rounded-xl bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 opacity-60"></div>
                <p className="text-sm font-semibold text-purple-700 mb-1">University</p>
                <p className="text-lg font-semibold text-gray-800">{account.university || 'Not set'}</p>
              </div>
              <div className="relative group rounded-xl bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4 border border-violet-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 opacity-60"></div>
                <p className="text-sm font-semibold text-violet-700 mb-1">Expertise Area</p>
                <p className="text-lg font-semibold text-gray-800">{account.expertiseAreas || 'Not set'}</p>
              </div>
              <div className="relative group rounded-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 opacity-60"></div>
                <p className="text-sm font-semibold text-indigo-700 mb-1">Experience (Years)</p>
                <p className="text-lg font-semibold text-gray-800">{account.experience || 'Not set'}</p>
              </div>
              <div className="relative group md:col-span-1 rounded-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 opacity-60"></div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Bio</p>
                <p className="text-gray-800 leading-relaxed">{account.bio || 'Not set'}</p>
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 rounded-2xl blur-lg opacity-20 -z-10"></div>
          </div>
        );
      }
      return null;
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 via-pink-100 to-orange-100 p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,92,246,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-violet-200 to-indigo-300 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>
        
        <div className="relative mx-auto max-w-4xl">
          {/* Header */}
          <div className="relative mb-6 flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-violet-500 via-blue-500 via-cyan-500 to-emerald-500 rounded-t-2xl"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">Profile</h1>
            <a href="/edit-profile" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30 focus:outline-none focus:ring-4 focus:ring-violet-200 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </div>
            </a>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 rounded-2xl blur-lg opacity-30 -z-10"></div>
          </div>
  
          <div className="space-y-8">
            {/* Main Profile Card */}
            <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl border border-white/60">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 via-blue-500 to-violet-500 rounded-t-2xl"></div>
              <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  {account.profileImage ? (
                    <div className="relative">
                      <img
                        src={account.profileImage}
                        alt="Profile"
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 blur opacity-60 -z-10"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-violet-500 to-cyan-500 text-4xl font-bold text-white shadow-xl border-4 border-white">
                        {account.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 blur opacity-60 -z-10"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent mb-6">{account.name}</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="group flex items-center p-3 rounded-xl bg-gradient-to-br from-pink-50 via-violet-50 to-purple-50 border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-200 to-violet-300 flex items-center justify-center mr-3 group-hover:from-pink-300 group-hover:to-violet-400 transition-colors duration-200 shadow-sm">
                        <Mail className="h-5 w-5 text-pink-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-semibold text-gray-800">{account.email}</p>
                      </div>
                    </div>
                    <div className="group flex items-center p-3 rounded-xl bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-200 to-purple-300 flex items-center justify-center mr-3 group-hover:from-violet-300 group-hover:to-purple-400 transition-colors duration-200 shadow-sm">
                        <Phone className="h-5 w-5 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{account.mobile || "Not set"}</p>
                      </div>
                    </div>
                    <div className="group flex items-center p-3 rounded-xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border border-cyan-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center mr-3 group-hover:from-cyan-300 group-hover:to-blue-400 transition-colors duration-200 shadow-sm">
                        <Briefcase className="h-5 w-5 text-cyan-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Role</p>
                        <p className="text-sm font-bold capitalize bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{account.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 rounded-2xl blur-lg opacity-30 -z-10"></div>
            </div>
  
            {/* Bio Section */}
            <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl border border-white/60">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-emerald-500 rounded-t-2xl"></div>
              <h3 className="border-b border-gradient-to-r from-orange-200 to-emerald-200 pb-3 text-xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-emerald-600 bg-clip-text text-transparent">About</h3>
              <p className="mt-4 text-gray-700 leading-relaxed text-lg">
                {account?.bio || "No bio information provided."}
              </p>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 via-yellow-300 to-emerald-300 rounded-2xl blur-lg opacity-20 -z-10"></div>
            </div>
            
            {/* Role Specific Details */}
            <RolesSpecificDetails />
          </div>
        </div>
      </div>
    );
}