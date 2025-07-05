import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertTriangle, Briefcase, Mail, Phone, User, ArrowLeft, Loader2, Star, MapPin, GraduationCap, Clock } from 'lucide-react';
import axios from '../config/axios.jsx';
import Reviews from './Reviews';
import { getUserById } from '../slices/userSlice';

export default function MentorProfile() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(true);
  
  const { data: currentUser } = useSelector((state) => state.account);
  const { user, loading, serverError: error } = useSelector((state) => state.users);

  // Fetch mentor profile data
  useEffect(() => {
    if (mentorId) {
      dispatch(getUserById(mentorId))
        .unwrap()
        .catch(err => {
          console.error('Error fetching mentor data:', err);
        });
    }
  }, [dispatch, mentorId]);

  // Fetch average rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        setIsLoadingRating(true);
        const response = await axios.get(`/reviews?mentorId=${mentorId}`, {
          headers: { Authorization: localStorage.getItem('token') }
        });
        
        if (response.data.length > 0) {
          const total = response.data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((total / response.data.length).toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    if (mentorId) {
      fetchAverageRating();
    }
  }, [mentorId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900 mb-2">Loading mentor profile...</div>
          <p className="text-gray-600 text-sm">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
        <div className="max-w-md bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-sm hover:shadow-md"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8">
        <div className="max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Mentor Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find this mentor's profile information.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-sm hover:shadow-md"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Profile image or initials
  const profileDisplay = user.profileImage ? (
    <img
      src={`http://localhost:3047${user.profileImage}`}
      alt={`${user.name}'s profile`}
      className="w-32 h-32 rounded-2xl object-cover border-4 border-emerald-200 shadow-lg"
    />
  ) : (
    <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-4 border-emerald-200 shadow-lg">
      <span className="text-4xl font-bold text-emerald-600">
        {user.name?.charAt(0).toUpperCase() || "M"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl font-medium transition-all border border-emerald-200 shadow-sm hover:shadow-md mr-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Mentors
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mentor Profile</h1>
                  <p className="text-gray-600 mt-1">Connect with your ideal mentor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar - Reviews section */}
          <div className="lg:w-1/3">
            <Reviews mentorId={mentorId} currentUser={currentUser} />
          </div>

          {/* Right side - Profile information */}
          <div className="lg:w-2/3 space-y-8">
            {/* Profile summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center space-y-6 lg:flex-row lg:space-y-0 lg:space-x-8">
                <div className="flex-shrink-0">
                  {profileDisplay}
                </div>
                
                <div className="flex-grow text-center lg:text-left w-full">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
                      {user.university && (
                        <p className="text-emerald-600 font-medium flex items-center justify-center lg:justify-start mb-3">
                          <MapPin className="h-5 w-5 mr-2" />
                          {user.university}
                        </p>
                      )}
                    </div>
                    {!isLoadingRating && (
                      <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" fill="#FFC107" />
                        <span className="text-emerald-800 font-semibold">
                          {averageRating > 0 ? averageRating : 'No ratings'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center mb-2">
                        <Mail className="h-5 w-5 text-emerald-600 mr-2" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center mb-2">
                        <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{user.mobile || "Not shared"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center mb-2">
                        <Briefcase className="h-5 w-5 text-emerald-600 mr-2" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience</p>
                      </div>
                      <p className="text-sm font-medium text-emerald-600">
                        {user.experience ? `${user.experience} years` : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">About</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  {user?.bio || "This mentor hasn't added a bio yet."}
                </p>
              </div>
            </div>

            {/* Mentor information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Mentor Information</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">University</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{user.university || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <GraduationCap className="h-5 w-5 text-emerald-600 mr-2" />
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Expertise Areas</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.expertiseAreas ? 
                      user.expertiseAreas.split(',').map((area, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200"
                        >
                          {area.trim()}
                        </span>
                      )) : 
                      <p className="text-gray-600">Not specified</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Contact this Mentor</h3>
              </div>
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                  <p className="text-emerald-800 font-medium">Ready to connect with {user.name}?</p>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Interested in connecting with {user.name}? You can reach out directly via email to discuss mentoring opportunities and schedule sessions.
                </p>
                <a 
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}