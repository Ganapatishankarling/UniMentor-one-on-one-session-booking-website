import React, { useState, useEffect } from 'react';
import axios from '../config/axios.jsx';
import { toast } from 'react-toastify';
import { Star, User, Loader2, Edit, Trash2 } from 'lucide-react';
import ReviewForm from './ReviewForm.jsx';

const Reviews = ({ mentorId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewDetails, setReviewDetails] = useState({});

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/reviews?mentorId=${mentorId}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      
      // Find the current user's review if they have one
      const currentUserReview = response.data.find(
        review => review.studentId === currentUser?._id
      );
      
      if (currentUserReview) {
        setUserReview(currentUserReview);
      } else {
        setUserReview(null);
      }
      
      // Set all reviews
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchReviews();
    }
  }, [mentorId]);

  const handleReviewSubmitted = () => {
    fetchReviews();
    setEditMode(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await axios.delete(`/review/${reviewId}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  const canReview = currentUser && currentUser.role === 'student';
  const showReviewForm = canReview && (!userReview || editMode);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
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

        {/* Review form for students only */}
        {showReviewForm ? (
          <div className="mt-6">
            <ReviewForm 
              mentorId={mentorId} 
              studentId={currentUser._id} 
              onReviewSubmitted={handleReviewSubmitted}
              existingReview={editMode ? userReview : null}
            />
          </div>
        ) : (
          canReview && userReview && (
            <div className="mt-6 bg-indigo-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">Your Review</h3>
                    <div className="flex ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          fill={i < userReview.rating ? '#FFC107' : 'none'}
                          stroke={i < userReview.rating ? '#FFC107' : '#CBD5E0'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-gray-700">{userReview.comment}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userReview._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Reviews list */}
      <div>
        {reviews.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {reviews
              .filter(review => review.studentId !== currentUser?._id) // Filter out current user's review as it's shown separately
              .map(review => {
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
            <p className="text-gray-500">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;