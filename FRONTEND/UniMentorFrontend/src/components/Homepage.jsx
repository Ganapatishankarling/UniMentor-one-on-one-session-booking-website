import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../slices/userSlice";
import { fetchUserAccount } from "../slices/accountSlice";
import { toast } from "react-toastify";
import axios from "../config/axios.jsx";
import { Filter } from "lucide-react";

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
  
  const { users, loading, error } = useSelector((state) => state.users);
  
  let mentors = users && users.length > 0 ? users.filter(user => user.role === "mentor") : [];  
  
  useEffect(() => {
    dispatch(listUsers());
    dispatch(fetchUserAccount());
  }, [dispatch]);

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
    ? mentors.filter(mentor => {
        const matchesSearch = searchTerm === "" || 
          mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mentor.bio && mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (mentor.university && mentor.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (mentor.expertiseAreas && mentor.expertiseAreas.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesExpertise = selectedExpertise === "All" || 
          (mentor.expertiseAreas && mentor.expertiseAreas.split(',')
            .map(item => item.trim())
            .includes(selectedExpertise));
            
        const approved = mentor.isActive === "approved"
        return matchesSearch && matchesExpertise && approved;
      })
    : [];
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Loading mentors...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-slate-100 min-h-screen">      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="w-full max-w-xl flex items-center space-x-4">
            {/* Search Form */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                className="pl-10 pr-3 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white"
              />
            </div>
            
            {/* Filter Icon with Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-center p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
              >
                <Filter className="h-5 w-5" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden right-0">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">
                      Filter by Expertise
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {expertiseAreas.map((area, index) => (
                        <button
                          key={index}
                          onClick={() => handleExpertiseChange(area)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selectedExpertise === area ? 'bg-slate-100 text-slate-800 font-medium' : 'text-gray-700'}`}
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
        
        {/* Header Section */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Connect with experienced professionals who can guide your learning journey</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-md">
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
        )}
        
        {/* Search Results Stats */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600">
            {filteredMentors.length} {filteredMentors.length === 1 ? 'mentor' : 'mentors'} found
            {selectedExpertise !== "All" && ` in ${selectedExpertise}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor) => (
              <div key={mentor._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-sm">
                      {mentor.profileImage ? (
                        <img 
                          src={`http://localhost:3047${mentor.profileImage}`}
                          alt={mentor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-slate-600">
                          {mentor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{mentor.name}</h3>
                      {mentor.university && (
                        <p className="text-slate-700 font-medium">{mentor.university}</p>
                      )}
                      
                      {/* Rating Stars */}
                      {!loadingRatings && (
                        <div className="flex items-center mt-1">
                          <svg className="h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm font-medium text-slate-600">
                            {mentorRatings[mentor._id]?.average > 0
                              ? mentorRatings[mentor._id]?.average
                              : "No ratings"}
                          </span>
                          {mentorRatings[mentor._id]?.count > 0 && (
                            <span className="ml-1 text-xs text-slate-500">
                              ({mentorRatings[mentor._id]?.count})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {mentor.expertiseAreas && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Expertise</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mentor.expertiseAreas.split(',').map((area, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200"
                          >
                            {area.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mentor.bio && (
                    <div className="mt-5">
                      <p className="text-slate-600 text-sm line-clamp-3">
                        {mentor.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <span className="text-slate-500 flex items-center">
                        <span className="h-2 w-2 bg-slate-300 rounded-full mr-1.5"></span>
                        Availability varies
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(mentor._id)}
                        className="bg-white border border-slate-400 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                      >
                        Profile
                      </button>
                      
                      <button
                        onClick={() => handleBookSession(mentor)}
                        className="bg-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all shadow-sm"
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-3xl font-bold text-slate-800 mt-4 mb-2">No mentors found</div>
            <p className="text-slate-600 text-lg">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}