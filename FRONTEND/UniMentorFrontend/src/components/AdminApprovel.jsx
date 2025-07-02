import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { listUsers } from "../slices/userSlice";
import { Star, User, Loader2, ArrowLeft, Mail, Phone, GraduationCap, Briefcase, MapPin, Calendar, Eye } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading mentors...</div>
          <p className="text-gray-600 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-xl font-semibold text-red-600">{error}</div>
          <p className="text-gray-600 text-sm mt-2">Something went wrong while loading the data</p>
        </div>
      </div>
    );
  }

  // Render detailed view of a mentor
  if (viewMode === "detail" && selectedMentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={handleBackToList}
            className="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to List
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* Profile Image Section */}
                <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-200 shadow-inner mb-6">
                    {selectedMentor.profileImage ? (
                      <img 
                        src={`http://localhost:3047${selectedMentor.profileImage}`}
                        alt={selectedMentor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl font-bold text-emerald-600">
                        {selectedMentor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMentor.name}</h2>
                  <p className="text-emerald-600 font-medium text-lg mb-4">{selectedMentor.university || "No university listed"}</p>
                  
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium ${
                      selectedMentor.isActive === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                      selectedMentor.isActive === "approved" ? "bg-green-100 text-green-800 border border-green-200" :
                      "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      Status: {selectedMentor.isActive.charAt(0).toUpperCase() + selectedMentor.isActive.slice(1)}
                    </span>
                    
                    {/* Rating Display */}
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" fill="#FFC107" />
                      <span className="text-emerald-800 font-semibold">
                        {averageRating > 0 ? averageRating : 'No ratings'}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-gray-500 text-sm ml-1">({reviews.length})</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mentor Details Section */}
                <div className="w-full lg:w-2/3 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-emerald-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{selectedMentor.email}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{selectedMentor.phone || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expertise Areas */}
                  <div className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-xl border border-emerald-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
                      Expertise Areas
                    </h3>
                    {selectedMentor.expertiseAreas ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.expertiseAreas.split(',').map((area, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-emerald-100 text-emerald-800 text-sm font-medium px-4 py-2 rounded-lg border border-emerald-200"
                          >
                            {area.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No expertise areas listed</p>
                    )}
                  </div>
                  
                  {/* Biography */}
                  <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Biography
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedMentor.bio || "No biography provided"}
                    </p>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start text-gray-700">
                        <GraduationCap className="h-4 w-4 mr-3 text-gray-400 mt-1" />
                        <div>
                          <span className="font-medium">Education:</span>
                          <p className="mt-1">{selectedMentor.education || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start text-gray-700">
                        <Briefcase className="h-4 w-4 mr-3 text-gray-400 mt-1" />
                        <div>
                          <span className="font-medium">Experience:</span>
                          <p className="mt-1">{selectedMentor.experience || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {selectedMentor.isActive !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMentor._id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center"
                      >
                        ✓ Approve
                      </button>
                    )}
                    
                    {selectedMentor.isActive !== "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMentor._id, "rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center"
                      >
                        ✗ Reject
                      </button>
                    )}
                    
                    {selectedMentor.isActive !== "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMentor._id, "pending")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center"
                      >
                        ⏳ Move to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                <div className="flex items-center bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" fill="#FFC107" />
                  <span className="text-emerald-800 font-semibold">{averageRating > 0 ? averageRating : 'No ratings'}</span>
                  {reviews.length > 0 && (
                    <span className="text-gray-500 text-sm ml-1">({reviews.length})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            {reviewsLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600 font-medium">Loading reviews...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reviews.map(review => {
                  const student = reviewDetails[review.studentId] || {};
                  return (
                    <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {student.profileImage ? (
                            <img
                              src={`http://localhost:3047${student.profileImage}`}
                              alt={student.name}
                              className="h-12 w-12 rounded-full border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center border-2 border-emerald-200">
                              <User className="h-6 w-6 text-emerald-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{student.name || 'Anonymous Student'}</h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5"
                                fill={i < review.rating ? '#FFC107' : 'none'}
                                stroke={i < review.rating ? '#FFC107' : '#CBD5E0'}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No reviews yet for this mentor.</p>
                <p className="text-gray-400 text-sm mt-1">Reviews will appear here once students start rating this mentor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mentor Approval Management</h1>
          <p className="text-gray-600 text-lg">Review and manage mentor applications with ease</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => handleTabChange("pending")}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "pending" 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Pending
                <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                  activeTab === "pending" 
                    ? "bg-white text-emerald-600" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {mentors.filter(m => m.isActive === "pending").length}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange("approved")}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "approved" 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Approved
                <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                  activeTab === "approved" 
                    ? "bg-white text-emerald-600" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {mentors.filter(m => m.isActive === "approved").length}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange("rejected")}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === "rejected" 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Rejected
                <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                  activeTab === "rejected" 
                    ? "bg-white text-emerald-600" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {mentors.filter(m => m.isActive === "rejected").length}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mentors List */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div 
                key={mentor._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1"
                onClick={() => handleViewMentor(mentor)}
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
                      <p className="text-emerald-600 font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {mentor.university || "No university listed"}
                      </p>
                    </div>
                  </div>
                  
                  {mentor.expertiseAreas && (
                    <div className="mb-4">
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
                  
                  <div className="mb-5">
                    {mentor.bio ? (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {mentor.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No biography provided</p>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMentor(mentor);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </button>
                    
                    <div className="flex gap-2">
                      {activeTab !== "approved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(mentor._id, "approved");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md font-medium"
                        >
                          ✓ Approve
                        </button>
                      )}
                      
                      {activeTab !== "rejected" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(mentor._id, "rejected");
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md font-medium"
                        >
                          ✗ Reject
                        </button>
                      )}
                      
                      {(activeTab === "approved" || activeTab === "rejected") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(mentor._id, "pending");
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md font-medium"
                        >
                          ⏳ Pending
                        </button>
                      )}
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
            <div className="text-2xl font-bold text-gray-900 mb-2">
              No {activeTab} mentors found
            </div>
            <p className="text-gray-600 text-lg">
              {activeTab === "pending" && "There are no pending mentor approval requests"}
              {activeTab === "approved" && "No mentors have been approved yet"}
              {activeTab === "rejected" && "No mentors have been rejected"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}