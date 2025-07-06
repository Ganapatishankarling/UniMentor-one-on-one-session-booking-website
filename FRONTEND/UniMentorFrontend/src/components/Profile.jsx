import React,{useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import { useNavigate,useParams } from 'react-router-dom'
import { fetchUserAccount } from '../slices/accountSlice.jsx'
import { listCategories } from '../slices/categorySlice.jsx'
import { AlertTriangle, Briefcase, Edit, Loader2, Mail, Phone, User, GraduationCap } from 'lucide-react'
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-semibold text-gray-900 mb-2">Loading profile information...</div>
            <p className="text-gray-600 text-sm">Please wait while we fetch your data</p>
          </div>
        </div>
      );
    }
  
    if (serverError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{serverError.message}</p>
            <button 
              onClick={() => dispatch(fetchUserAccount())}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  
    if (!account) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Account Data Available</h2>
            <p className="text-gray-600 mb-4">We couldn't find any profile information for this account.</p>
            <button 
              onClick={()=>navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }
  
    const RolesSpecificDetails = () => {
      if (account?.role === 'student') {
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Student Information</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">University</p>
                <p className="text-lg font-semibold text-gray-900">{account.university || 'Not set'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Education</p>
                <p className="text-lg font-semibold text-gray-900">{account.education || 'Not set'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Graduation Year</p>
                <p className="text-lg font-semibold text-gray-900">{account.graduationYear || 'Not set'}</p>
              </div>
            </div>
          </div>
        );
      } else if (account.role === 'mentor') {
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mentor Information</h3>
            </div>
            
            {/* Mentor Activation Toggle */}
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4 border border-emerald-200 mb-6">
              <span className="text-lg font-semibold text-emerald-800">Activate Mentor Status</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isActive}
                  onChange={(e) => handleActivateMentor(account._id, e.target.checked)}
                />
                <div className="peer h-8 w-14 rounded-full bg-gray-300 shadow-inner transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-7 after:w-7 after:rounded-full after:bg-white after:shadow-lg after:transition-all after:duration-300 peer-checked:bg-emerald-500 peer-checked:after:translate-x-6 hover:shadow-md"></div>
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">University</p>
                <p className="text-lg font-semibold text-gray-900">{account.university || 'Not set'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Expertise Area</p>
                <p className="text-lg font-semibold text-gray-900">{account.expertiseAreas || 'Not set'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Experience (Years)</p>
                <p className="text-lg font-semibold text-gray-900">{account.experience || 'Not set'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 md:col-span-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Bio</p>
                <p className="text-gray-800 leading-relaxed">{account.bio || 'Not set'}</p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              </div>
              <a 
                href="/edit-profile" 
                className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </div>
          </div>

          <div className="space-y-8">
            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  {account.profileImage ? (
                    <img
                      src={account.profileImage}
                      alt="Profile"
                      className="h-32 w-32 rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center text-4xl font-bold text-emerald-600 border-2 border-emerald-200 shadow-lg">
                      {account.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{account.name}</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-semibold text-gray-800">{account.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{account.mobile || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</p>
                        <p className="text-sm font-bold capitalize text-emerald-600">{account.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">About</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {account?.bio || "No bio information provided."}
              </p>
            </div>
            
            {/* Role Specific Details */}
            <RolesSpecificDetails />
          </div>
        </div>
      </div>
    );
}