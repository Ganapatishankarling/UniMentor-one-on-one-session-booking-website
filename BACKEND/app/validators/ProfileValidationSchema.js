export const updateBasicProfileValidationSchema = {
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
    
};

export const updateEducationAndBioValidationSchema = {
    university: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'University cannot be empty'
        },
        trim: true
    },
    bio: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'Bio cannot be empty'
        },
        trim: true
    },
}

export const updateProfileImageValidationSchema = {
    profileImage: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: 'Profile image URL cannot be empty'
        },
        isURL: {
            errorMessage: 'Profile image must be a valid URL'
        },
        trim: true
    }
}