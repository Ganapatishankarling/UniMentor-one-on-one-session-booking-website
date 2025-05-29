import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertTriangle, Briefcase, Mail, Phone, User, ArrowLeft, Loader2, Star } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="rounded-xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg font-medium text-gray-700">Loading mentor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md rounded-xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Error Loading Profile</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md rounded-xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Mentor Not Found</h2>
            <p className="mt-2 text-gray-600">We couldn't find this mentor's profile information.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile image or initials
  const profileDisplay = user.profileImage ? (
    <img
      src={`http://localhost:3047${user.profileImage}`}
      alt={`${user.name}'s profile`}
      className="h-32 w-32 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
      {user.name?.charAt(0).toUpperCase() || "M"}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header section */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Mentors
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Profile</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Reviews section */}
          <div className="md:w-1/3">
            <Reviews mentorId={mentorId} currentUser={currentUser} />
          </div>

          {/* Right side - Profile information */}
          <div className="md:w-2/3 space-y-6">
            {/* Profile summary */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  {profileDisplay}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    {!isLoadingRating && (
                      <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full mt-2 md:mt-0">
                        <Star className="h-5 w-5 text-yellow-500 mr-1" fill="#FFC107" />
                        <span className="text-indigo-800 font-medium">
                          {averageRating > 0 ? averageRating : 'No ratings'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{user.mobile || "Not shared"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Experience</p>
                        <p className="text-sm font-medium text-indigo-600">
                          {user.experience ? `${user.experience} years` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About section */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">About</h3>
              <p className="mt-4 text-gray-700">
                {user?.bio || "This mentor hasn't added a bio yet."}
              </p>
            </div>

            {/* Mentor information */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">Mentor Information</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">University</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.university || 'Not specified'}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Expertise Areas</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.expertiseAreas ? 
                      user.expertiseAreas.split(',').map((area, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
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
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">Contact this Mentor</h3>
              <div className="mt-4">
                <p className="text-gray-700 mb-4">
                  Interested in connecting with {user.name}? You can reach out directly via email.
                </p>
                <a 
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Mail className="mr-2 h-4 w-4" />
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