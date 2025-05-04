import User from '../models/UserModel.js';

export const profileValidationSchema = {
    name: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'Name cannot be empty'
        },
        trim: true
    },
    email: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Invalid email format'
        },
        trim: true,
        normalizeEmail: true
    },
    mobile: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'Mobile number cannot be empty'
        },
        isMobilePhone: {
            errorMessage: 'Invalid mobile number'
        },
        trim: true
    },
    role: {
        in: ['body'],
        optional: true,
        isIn: {
            options: [['mentor', 'student']],
            errorMessage: 'Invalid role'
        }
    },
    university: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value, { req }) => {
                const role = req.body.role;
                if (['mentor', 'student'].includes(role) && !value) {
                    throw new Error('University is required for mentors and students');
                }
                return true;
            }
        },
        trim: true
    },
    bio: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value, { req }) => {
                if (req.body.role === 'mentor' && !value) {
                    throw new Error('Bio is required for mentors');
                }
                return true;
            }
        },
        trim: true
    },
    expertiseAreas: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value, { req }) => {
                if (req.body.role === 'mentor' && !value) {
                    throw new Error('Expertise areas are required for mentors');
                }
                return true;
            }
        },
        trim: true
    },
    mentorFee: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value, { req }) => {
                if (req.body.role === 'mentor') {
                    if (value === undefined || value === null || isNaN(value)) {
                        throw new Error('Mentor fee is required');
                    }
                }
                return true;
            }
        }
    },
    education: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value, { req }) => {
                if (['mentor', 'student'].includes(req.body.role) && !value) {
                    throw new Error('Education is required for mentors and students');
                }
                return true;
            }
        },
        trim: true
    }
};



   