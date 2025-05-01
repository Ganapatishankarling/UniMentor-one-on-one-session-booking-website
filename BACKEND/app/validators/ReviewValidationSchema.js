import Session from '../models/SessionModel.js'
import User from '../models/UserModel.js'

export const reviewValidationSchema = {
    sessionId: {
        in: ['body'],
        exists: {
            errorMessage: 'Session ID is required'
        },
        notEmpty: {
            errorMessage: 'Session ID cannot be empty'
        },
        isMongoId: {
            errorMessage: 'Session ID must be a valid Mongo ID'
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
              const session = await Session.findById(value);
              if (!session) {
                throw new Error('Session not found');
              }
      
              if (session.studentId.toString() !== req.userId) {
                throw new Error('You are not authorized to review this session');
              }
              return true;
            }
          }
    },
    mentorId: {
        in: ['body'],
        exists: {
            errorMessage: 'Mentor ID is required'
        },
        notEmpty: {
            errorMessage: 'Mentor ID cannot be empty'
        },
        isMongoId: {
            errorMessage: 'Mentor ID must be a valid Mongo ID'
        },
        trim: true
    },
    studentId: {
        in: ['body'],
        exists: {
            errorMessage: 'Student ID is required'
        },
        notEmpty: {
            errorMessage: 'Student ID cannot be empty'
        },
        isMongoId: {
            errorMessage: 'Student ID must be a valid Mongo ID'
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
              const session = await Session.findById(req.body.sessionId);
              if (!session) {
                throw new Error('Session not found');
              }
          
              const studentId = session.studentId.toString();
              const userId = req.userId;
              console.log(userId)
          
              if (userId !== studentId) {
                throw new Error('You are not authorized to review this session');
              }
              if (req.role !== 'student') {
                throw new Error('Only students can review sessions');
              }
          
              return true;
            }
          }
    },
    rating: {
        in: ['body'],
        exists: {
            errorMessage: 'Rating is required'
        },
        notEmpty: {
            errorMessage: 'Rating cannot be empty'
        },
        isFloat: {
            options: { min: 1, max: 5 },
            errorMessage: 'Rating must be a number between 1 and 5'
        }
    },
    comment: {
        in: ['body'],
        optional: true,
        trim: true,
        isLength: {
            options: { max: 500 },
            errorMessage: 'Comment should not exceed 500 characters'
        }
    },
};
export const reviewUpdateValidationSchema = {
    rating: {
        in: ['body'],
        optional: true,
        isFloat: {
            options: { min: 1, max: 5 },
            errorMessage: 'Rating must be a number between 1 and 5'
        }
    },
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
