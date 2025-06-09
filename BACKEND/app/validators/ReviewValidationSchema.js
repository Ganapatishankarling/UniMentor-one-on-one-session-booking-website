import Session from '../models/SessionModel.js';
import ReviewModel from '../models/ReviewModel.js'

export const reviewValidationSchema = {
  // Validating mentor ID from params
  // mentorId: {
  //   in: ['params'],
  //   exists: { errorMessage: 'Mentor ID is required' },
  //   notEmpty: { errorMessage: 'Mentor ID cannot be empty' },
  //   isMongoId: { errorMessage: 'Mentor ID must be a valid Mongo ID' },
  //   trim: true,
  // },
  
  studentId: {
    in: ['body'],
    exists: { errorMessage: 'Student ID is required' },
    notEmpty: { errorMessage: 'Student ID cannot be empty' },
    isMongoId: { errorMessage: 'Student ID must be a valid Mongo ID' },
    trim: true,
    custom: {
      options: async (value, { req }) => {
        // Verify the user role
        if (req.role !== 'student') {
          throw new Error('Only students can create reviews');
        }
        
        // Verify the student is the one making the request
        if (req.userId !== value) {
          throw new Error('You can only submit reviews using your own student ID');
        }
        
        // Check if there's an existing session between student and mentor
        const session = await Session.findOne({
          mentorId: req.params.id,
          studentId: value,
          status: 'completed' // Assuming you can only review completed sessions
        });
        
        if (!session) {
          throw new Error('You must have a completed session with this mentor to leave a review');
        }
        
        // Check if student has already reviewed this mentor
        const existingReview = await ReviewModel.findOne({
          mentorId: req.params.id,
          studentId: value
        });
        
        if (existingReview) {
          throw new Error('You have already reviewed this mentor. You can update your existing review instead.');
        }
        
        return true;
      }
    }
  },
  
  // Validating review rating
  rating: {
    in: ['body'],
    exists: { errorMessage: 'Rating is required' },
    notEmpty: { errorMessage: 'Rating cannot be empty' },
    isFloat: {
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be a number between 1 and 5'
    }
  },
  
  // Validating comment (optional)
  comment: {
    in: ['body'],
    optional: true,
    trim: true,
    isLength: {
      options: { max: 500 },
      errorMessage: 'Comment should not exceed 500 characters'
    }
  }
};

export const reviewUpdateValidationSchema = {
  id: {
    in: ['params'],
    exists: { errorMessage: 'Review ID is required' },
    notEmpty: { errorMessage: 'Review ID cannot be empty' },
    isMongoId: { errorMessage: 'Review ID must be a valid Mongo ID' },
    trim: true,
    custom: {
      options: async (value, { req }) => {
        // Find the review to verify ownership
        const review = await ReviewModel.findById(value);
        
        if (!review) {
          throw new Error('Review not found');
        }
        
        // Verify the student is the one making the update
        if (req.userId !== review.studentId.toString()) {
          throw new Error('You can only update your own reviews');
        }
        
        if (req.role !== 'student') {
          throw new Error('Only students can update reviews');
        }
        
        return true;
      }
    }
  },
  
  // Validating updated rating (optional for update)
  rating: {
    in: ['body'],
    optional: true,
    isFloat: {
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be a number between 1 and 5'
    }
  },
  
  // Validating updated comment (optional)
  comment: {
    in: ['body'],
    optional: true,
    trim: true,
    isLength: {
      options: { max: 500 },
      errorMessage: 'Comment should not exceed 500 characters'
    }
  }
};