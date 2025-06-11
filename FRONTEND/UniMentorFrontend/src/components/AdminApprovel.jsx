import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { listUsers } from "../slices/userSlice";
import { Star, User, Loader2 } from 'lucide-react';

export default function AdminApproval() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or detail
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewDetails, setReviewDetails] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const { users, loading, error } = useSelector((state) => state.users);

    
  let mentors = users && users.length > 0 ? users.filter(user => user.role === "mentor") : [];  
    useEffect(() => {
      dispatch(listUsers());
     
    }, [dispatch]);
    console.log("user",mentors);

  // Fetch reviews for a specific mentor
  const fetchMentorReviews = async (mentorId) => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(`/reviews?mentorId=${mentorId}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      
      setReviews(response.data);
      
      // Calculate average rating
      if (response.data.length > 0) {
        const total = response.data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating((total / response.data.length).toFixed(1));
      } else {
        setAverageRating(0);
      }

      // Fetch user details for each review
      const studentIds = [...new Set(response.data.map(review => review.studentId))];
      
      const detailsPromises = studentIds.map(id => 
        axios.get(`/user/${id}`, {
          headers: { Authorization: localStorage.getItem('token') }
        })
      );
      
      const detailsResponses = await Promise.all(detailsPromises.map(p => p.catch(e => null)));
      
      const details = {};
      detailsResponses.forEach((res, index) => {
        if (res && res.data) {
          details[studentIds[index]] = res.data;
        }
      });
      
      setReviewDetails(details);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };
    

  // Filter mentors based on active tab
  const filteredMentors = mentors.filter(mentor => {
    switch (activeTab) {
      case "pending":
        return mentor.isActive === "pending";
      case "approved":
        return mentor.isActive === "approved";
      case "rejected":
        return mentor.isActive === "rejected";
      default:
        return true;
    }
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedMentor(null);
    setViewMode("list");
  };

  const handleViewMentor = (mentor) => {
    setSelectedMentor(mentor);
    setViewMode("detail");
    // Fetch reviews when viewing mentor details
    fetchMentorReviews(mentor._id);
  };

  const handleBackToList = () => {
    setSelectedMentor(null);
    setViewMode("list");
    setReviews([]);
    setReviewDetails({});
    setAverageRating(0);
  };

  const handleUpdateStatus = async (mentorId, status) => {
    try {
      const response = await axios.patch(`/adminApprove/${mentorId}`, { status },{headers:{Authorization:localStorage.getItem('token')}});
dispatch(listUsers())
      
      // If in detail view, update the selected mentor
      if (selectedMentor && selectedMentor._id === mentorId) {
        setSelectedMentor({ ...selectedMentor, isActive: status });
      }
      
      toast.success(`Mentor has been ${status}`);
      
      // Optionally return to list view if approving/rejecting from detail view
      if (viewMode === "detail") {
        handleBackToList();
      }
    } catch (err) {
      toast.error("Failed to update mentor status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading mentors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  // Render detailed view of a mentor
  if (viewMode === "detail" && selectedMentor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button 
          onClick={handleBackToList}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to List
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Image Section */}
              <div className="w-full md:w-1/4 flex flex-col items-center">
                <div className="w-40 h-40 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-200 shadow-inner mb-4">
                  {selectedMentor.profileImage ? (
                    <img 
                      src={`http://localhost:3047${selectedMentor.profileImage}`}
                      alt={selectedMentor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-bold text-indigo-500">
                      {selectedMentor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMentor.name}</h2>
                  <p className="text-indigo-600 font-medium">{selectedMentor.university || "No university listed"}</p>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMentor.isActive === "pending" ? "bg-yellow-100 text-yellow-800" :
                      selectedMentor.isActive === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      Status: {selectedMentor.isActive.charAt(0).toUpperCase() + selectedMentor.isActive.slice(1)}
                    </span>
                    
                    {/* Rating Display */}
                    <div className="flex items-center justify-center bg-indigo-100 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#FFC107" />
                      <span className="text-indigo-800 font-medium text-sm">
                        {averageRating > 0 ? averageRating : 'No ratings'}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-gray-500 text-xs ml-1">({reviews.length})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mentor Details Section */}
              <div className="w-full md:w-3/4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {selectedMentor.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedMentor.phone || "Not provided"}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Expertise Areas</h3>
                  {selectedMentor.expertiseAreas ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertiseAreas.split(',').map((area, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {area.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No expertise areas listed</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Biography</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {selectedMentor.bio || "No biography provided"}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Information</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Education:</span> {selectedMentor.education || "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Experience:</span> {selectedMentor.experience || "Not provided"}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  {selectedMentor.isActive !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMentor._id, "approved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  
                  {selectedMentor.isActive !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMentor._id, "rejected")}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reject
                    </button>
                  )}
                  
                  {selectedMentor.isActive !== "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMentor._id, "pending")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Move to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Student Reviews</h2>
              <div className="flex items-center">
                <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" fill="#FFC107" />
                  <span className="text-indigo-800 font-medium">{averageRating > 0 ? averageRating : 'No ratings'}</span>
                  {reviews.length > 0 && (
                    <span className="text-gray-500 text-sm ml-1">({reviews.length})</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div>
            {reviewsLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {reviews.map(review => {
                  const student = reviewDetails[review.studentId] || {};
                  return (
                    <li key={review._id} className="p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {student.profileImage ? (
                            <img
                              src={`http://localhost:3047${student.profileImage}`}
                              alt={student.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-indigo-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{student.name || 'Anonymous Student'}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4"
                                fill={i < review.rating ? '#FFC107' : 'none'}
                                stroke={i < review.rating ? '#FFC107' : '#CBD5E0'}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No reviews yet for this mentor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-indigo-900 mb-8">Mentor Approval Management</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => handleTabChange("pending")}
            className={`py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === "pending" 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } transition-colors`}
          >
            Pending
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {mentors.filter(m => m.isActive === "pending").length}
            </span>
          </button>
          
          <button
            onClick={() => handleTabChange("approved")}
            className={`py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === "approved" 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } transition-colors`}
          >
            Approved
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {mentors.filter(m => m.isActive === "approved").length}
            </span>
          </button>
          
          <button
            onClick={() => handleTabChange("rejected")}
            className={`py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === "rejected" 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } transition-colors`}
          >
            Rejected
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {mentors.filter(m => m.isActive === "rejected").length}
            </span>
          </button>
        </div>
      </div>
      
      {/* Mentors List */}
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div 
              key={mentor._id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
              onClick={() => handleViewMentor(mentor)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                    {mentor.profileImage ? (
                      <img 
                        src={`http://localhost:3047${mentor.profileImage}`}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-500">
                        {mentor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
                    <p className="text-indigo-600">{mentor.university || "No university listed"}</p>
                  </div>
                </div>
                
                {mentor.expertiseAreas && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertiseAreas.split(',').slice(0, 3).map((area, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full"
                        >
                          {area.trim()}
                        </span>
                      ))}
                      {mentor.expertiseAreas.split(',').length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          +{mentor.expertiseAreas.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-5">
                  {mentor.bio ? (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {mentor.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No biography provided</p>
                  )}
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMentor(mentor);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Profile
                  </button>
                  
                  <div className="flex gap-2">
                    {activeTab !== "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(mentor._id, "approved");
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    
                    {activeTab !== "rejected" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(mentor._id, "rejected");
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    
                    {(activeTab === "approved" || activeTab === "rejected") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(mentor._id, "pending");
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Pending
                      </button>
                    )}
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
          <div className="text-2xl font-bold text-indigo-800 mt-4 mb-2">
            No {activeTab} mentors found
          </div>
          <p className="text-indigo-600 text-lg">
            {activeTab === "pending" && "There are no pending mentor approval requests"}
            {activeTab === "approved" && "No mentors have been approved yet"}
            {activeTab === "rejected" && "No mentors have been rejected"}
          </p>
        </div>
      )}
    </div>
  );
}