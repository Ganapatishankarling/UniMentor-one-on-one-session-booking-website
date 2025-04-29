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
        trim: true
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
        trim: true
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
