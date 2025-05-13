import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { listUsers } from "../slices/userSlice";
import { fetchUserAccount } from "../slices/accountSlice";
import { toast } from "react-toastify";
import axios from "../config/axios";

export default function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);
  const [mentorsWithAvailability, setMentorsWithAvailability] = useState({});
  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const availabilityDropdownRef = useRef(null);
  
  const { users, loading, error } = useSelector((state) => state.users);
  const { data } = useSelector((state) => state.account);
  
  
  let mentors = users && users.length > 0 ? users.filter(user => user.role === "mentor") : [];  
  
  useEffect(() => {
    dispatch(listUsers());
    dispatch(fetchUserAccount());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (availabilityDropdownRef.current && !availabilityDropdownRef.current.contains(event.target)) {
        setShowAvailabilityDropdown(false);
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
            
        const matchesAvailability = availabilityFilter === "all" || 
          (availabilityFilter === "available" && mentorsWithAvailability[mentor._id]);
        
          const approved = mentor.isActive === "approved"
        return matchesSearch && matchesExpertise && matchesAvailability && approved;
      })
    : [];
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleExpertiseChange = (expertise) => {
    setSelectedExpertise(expertise);
    setShowFilterDropdown(false);
  };
  
  const handleAvailabilityChange = (availability) => {
    setAvailabilityFilter(availability);
    setShowAvailabilityDropdown(false);
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
  navigate(`/book-session/${mentor._id}`);
};
  
  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };

  const navigateToProfile = () => {
    navigate("/profile");
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    navigate("/login");
    setProfileDropdownOpen(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading mentors...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen">
      {/* Enhanced Navigation Bar with Search and Filters */}
      <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-900 cursor-pointer" onClick={() => navigate("/")}>
                UniMentor
              </h1>
            </div>
            
            {/* Center: Search and Filter - Hidden on mobile */}
            <div className="hidden md:flex flex-1 justify-center px-6">
              <div className="w-full max-w-xl flex items-center space-x-4">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search mentors..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-3 py-2 w-full border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </form>
                
                {/* Filter Dropdown - Expertise */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <span>{selectedExpertise === "All" ? "All Categories" : selectedExpertise}</span>
                    <svg className={`ml-2 h-5 w-5 text-indigo-500 transform ${showFilterDropdown ? 'rotate-180' : ''} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto py-1">
                        {expertiseAreas.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => handleExpertiseChange(area)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${selectedExpertise === area ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filter Dropdown - Availability */}
                <div className="relative" ref={availabilityDropdownRef}>
                  <button
                    onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
                    className="flex items-center px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <span>{availabilityFilter === "all" ? "All Availability" : "Available Now"}</span>
                    <svg className={`ml-2 h-5 w-5 text-indigo-500 transform ${showAvailabilityDropdown ? 'rotate-180' : ''} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showAvailabilityDropdown && (
                    <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => handleAvailabilityChange("all")}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${availabilityFilter === "all" ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                        >
                          All Mentors
                        </button>
                        <button
                          onClick={() => handleAvailabilityChange("available")}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${availabilityFilter === "available" ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                        >
                          Available for Booking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side: Profile & Mobile Menu Toggle */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="md:hidden mr-3 text-indigo-700 hover:text-indigo-900 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              
              {/* Profile button */}
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {data?.name || "User"}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                    {data?.profileImage ? (
                      <img 
                        src={`http://localhost:3047${data.profileImage}`}
                        alt={data?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-indigo-500">
                        {data?.name ? data.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <button
                      onClick={navigateToProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white shadow-md z-10 md:hidden">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-3 py-2 w-full border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </form>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex justify-between items-center w-full px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none transition-all"
              >
                <span>{selectedExpertise === "All" ? "All Categories" : selectedExpertise}</span>
                <svg className={`h-5 w-5 text-indigo-500 transform ${showFilterDropdown ? 'rotate-180' : ''} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showFilterDropdown && (
                <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {expertiseAreas.map((area, index) => (
                      <button
                        key={index}
                        onClick={() => handleExpertiseChange(area)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${selectedExpertise === area ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
                className="flex justify-between items-center w-full px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none transition-all"
              >
                <span>{availabilityFilter === "all" ? "All Availability" : "Available Now"}</span>
                <svg className={`h-5 w-5 text-indigo-500 transform ${showAvailabilityDropdown ? 'rotate-180' : ''} transition-transform`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showAvailabilityDropdown && (
                <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => handleAvailabilityChange("all")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${availabilityFilter === "all" ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                    >
                      All Mentors
                    </button>
                    <button
                      onClick={() => handleAvailabilityChange("available")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${availabilityFilter === "available" ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700'}`}
                    >
                      Available for Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Header Section */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Connect with experienced professionals who can guide your learning journey</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
          <p className="text-gray-700">
            {filteredMentors.length} {filteredMentors.length === 1 ? 'mentor' : 'mentors'} found
            {selectedExpertise !== "All" && ` in ${selectedExpertise}`}
            {availabilityFilter !== "all" && ` with available sessions`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {/* Mentors Grid */}
        {  filteredMentors.length  > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor) => (
              <div key={mentor._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 transform hover:scale-[1.02] hover:shadow-xl">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-200 shadow-inner">
                      {mentor.profileImage ? (
                        <img 
                          src={`http://localhost:3047${mentor.profileImage}`}
                          alt={mentor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-indigo-500">
                          {mentor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                      {mentor.university && (
                        <p className="text-indigo-600 font-medium">{mentor.university}</p>
                      )}
                    </div>
                  </div>
                  
                  {mentor.expertiseAreas && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Expertise</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mentor.expertiseAreas.split(',').map((area, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
                          >
                            {area.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mentor.bio && (
                    <div className="mt-5">
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {mentor.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      {mentorsWithAvailability[mentor._id] ? (
                        <span className="text-green-600 font-medium flex items-center">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                          Available for booking
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center">
                          <span className="h-2 w-2 bg-gray-300 rounded-full mr-1.5"></span>
                          No available sessions
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(mentor._id)}
                        className="bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      >
                        Profile
                      </button>
                      
                      <button
                        onClick={() => handleBookSession(mentor)}
                        className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all ${
                       mentor.mentorIshAvailability
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <svg className="mx-auto h-16 w-16 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-3xl font-bold text-indigo-800 mt-4 mb-2">No mentors found</div>
            <p className="text-indigo-600 text-lg">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}