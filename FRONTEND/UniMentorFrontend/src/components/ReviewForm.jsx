import React, { useState } from 'react';
import axios from '../config/axios.jsx';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';

export default function ReviewForm({ mentorId, studentId, onReviewSubmitted, existingReview = null }){
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (existingReview) {
        // Update existing review
        await axios.put(
          `/update-reviews/${existingReview._id}`,
          { rating, comment, studentId },
          { headers: { Authorization: localStorage.getItem('token') }}
        );
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await axios.post(
          `/create-reviews/${mentorId}`,
          { rating, comment, studentId },
          { headers: { Authorization: localStorage.getItem('token') }}
        );
        toast.success('Review submitted successfully');
      }
      
      // Reset form if it's a new review
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
      
      // Trigger callback to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? 'Edit Your Review' : 'Leave a Review'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
              >
                <Star
                  fill={(hover || rating) >= star ? '#FFC107' : 'none'}
                  stroke={(hover || rating) >= star ? '#FFC107' : '#CBD5E0'}
                  className="w-8 h-8 cursor-pointer transition-colors"
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this mentor..."
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
            submitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {submitting 
            ? 'Submitting...' 
            : existingReview 
              ? 'Update Review' 
              : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};