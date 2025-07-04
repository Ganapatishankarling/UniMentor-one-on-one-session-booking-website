import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../slices/userSlice";
import { fetchUserAccount } from "../slices/accountSlice";
import { toast } from "react-toastify";
import axios from "../config/axios.jsx";
import { useCallback } from 'react';
import { debounce } from 'lodash';
import { Filter, Search, Star, MapPin, User, GraduationCap, Clock } from "lucide-react";

export default function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mentorRatings, setMentorRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);
  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
        setSearchTerm(searchValue);
    }, 500),
    []
);

  
  const { users, loading, error } = useSelector((state) => state.users);
  
  let mentors = users && users.length > 0 ? users : [];
  
  useEffect(() => {
    const queryParams = {
        role: 'mentor',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedExpertise !== 'All' && { expertise: selectedExpertise })
    };
    dispatch(listUsers(queryParams));
    dispatch(fetchUserAccount());
  }, [dispatch,searchTerm, selectedExpertise]);

  // Fetch mentor ratings
  useEffect(() => {
    if (!mentors || mentors.length === 0) return;

    const fetchMentorRatings = async () => {
      try {
        setLoadingRatings(true);
        const ratingPromises = mentors.map(mentor =>
          axios
            .get(`/reviews?mentorId=${mentor._id}`, {
              headers: { Authorization: localStorage.getItem('token') },
            })
            .catch(() => ({ data: [] }))
        );

        const ratingResponses = await Promise.all(ratingPromises);

        const ratings = {};
        mentors.forEach((mentor, index) => {
          const reviews = ratingResponses[index].data || [];
          if (reviews.length > 0) {
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            const average = (total / reviews.length).toFixed(1);
            ratings[mentor._id] = { average, count: reviews.length };
          } else {
            ratings[mentor._id] = { average: 0, count: 0 };
          }
        });

        setMentorRatings((prevRatings) => {
          const isSame =
            Object.keys(prevRatings).length === Object.keys(ratings).length &&
            Object.keys(ratings).every(
              key =>
                prevRatings[key]?.average === ratings[key].average &&
                prevRatings[key]?.count === ratings[key].count
            );
          return isSame ? prevRatings : ratings;
        });
      } catch (error) {
        console.error('Error fetching mentor ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchMentorRatings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const expertiseAreas = mentors && mentors.length > 0 
    ? ["All", ...new Set(mentors.flatMap(mentor => 
        mentor.expertiseAreas ? mentor.expertiseAreas.split(',').map(item => item.trim()) : []
      ))]
    : ["All"];
  
const filteredMentors = mentors && mentors.length > 0
    ? mentors.filter(mentor => mentor.isActive === "approved")
    : [];
  
 const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
};
  const handleExpertiseChange = (expertise) => {
    setSelectedExpertise(expertise);
    setShowFilterDropdown(false);
};
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };
  
  const handleViewProfile = (mentorId) => {
    navigate(`/mentor/${mentorId}`);
  };
  
  const handleBookSession = (mentor) => {
    if (mentor.mentorIshAvailability) {
      navigate(`/book-session/${mentor._id}`);
    } else {
      toast.info("This mentor is not currently available for booking");
    }
  };
    
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading mentors...</div>
          <p className="text-gray-600 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Your Perfect Mentor</h1>
          <p className="text-gray-600 text-lg">Connect with experienced professionals who can guide your learning journey</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Form */}
              <div className="flex-1 relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search mentors by name, expertise, or university..."
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  {selectedExpertise === "All" ? "All Expertise" : selectedExpertise}
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute z-20 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden right-0">
                    <div className="py-2">
                      <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                        Filter by Expertise
                      </div>
                      <div className="max-h-60 overflow-y-auto py-2">
                        {expertiseAreas.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => handleExpertiseChange(area)}
                            className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${selectedExpertise === area ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-4 border-emerald-600' : 'text-gray-700'}`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Results Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 px-4 py-2">
            <p className="text-gray-700 font-medium">
              {filteredMentors.filter((item)=>item.role === "mentor").length} {filteredMentors.length === 1 ? 'mentor' : 'mentors'} found
              {selectedExpertise !== "All" && (
                <span className="text-emerald-600"> in {selectedExpertise}</span>
              )}
              {searchTerm && (
                <span className="text-emerald-600"> matching "{searchTerm}"</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.filter((item)=>item.role === "mentor").map((mentor) => (
              <div 
                key={mentor._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-200 shadow-inner">
                      {mentor.profileImage ? (
                        <img 
                          src={`http://localhost:3047${mentor.profileImage}`}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-emerald-600">
                          {mentor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                      {mentor.university && (
                        <p className="text-emerald-600 font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {mentor.university}
                        </p>
                      )}
                      
                      {/* Rating Stars */}
                      {!loadingRatings && (
                        <div className="flex items-center mt-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 w-fit">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#FFC107" />
                          <span className="text-sm font-semibold text-emerald-800">
                            {mentorRatings[mentor._id]?.average > 0
                              ? mentorRatings[mentor._id]?.average
                              : "No ratings"}
                          </span>
                          {mentorRatings[mentor._id]?.count > 0 && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({mentorRatings[mentor._id]?.count})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {mentor.expertiseAreas && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertiseAreas.split(',').slice(0, 3).map((area, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200"
                          >
                            {area.trim()}
                          </span>
                        ))}
                        {mentor.expertiseAreas.split(',').length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
                            +{mentor.expertiseAreas.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {mentor.bio && (
                    <div className="mb-5">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {mentor.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Available for sessions</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(mentor._id)}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                      >
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => handleBookSession(mentor)}
                        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-sm hover:shadow-md"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">No mentors found</div>
            <p className="text-gray-600 text-lg">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}