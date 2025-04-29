export const forgotPasswordValidationSchema = {
    email: {
      in: ['body'],
      exists: {
        errorMessage: 'email field is required'
      },
      notEmpty: {
        errorMessage: 'email field cannot be empty'
      },
      trim: true,
      normalizeEmail: true,
      isEmail: {
        errorMessage: 'email is not valid'
      }
    },
    newPassword: {
      in: ['body'],
      exists: {
        errorMessage: 'newPassword field is required'
      },
      notEmpty: {
        errorMessage: 'newPassword field should not be empty'
      },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minUpperCase: 1,
          minLowerCase: 1,
          minNumber: 1,
          minSymbol: 1
        },
        errorMessage: 'Password should be 8 characters long and must contain at least one uppercase, one lowercase, one number, and one symbol'
      }
    },
    // forgotPasswordToken:{
    //     in:['body'],
    //     exists:{
    //         errorMessage:'forgotPasswordToken field is required'
    //     },
    //     notEmpty:{
    //         errorMessage:'forgotPasswordToken field should not be empty'
    //     }
    // }
  };
  