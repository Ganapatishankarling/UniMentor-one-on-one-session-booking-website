import User from '../models/UserModel.js';

export const userRegisterValidationSchema = {
    name:{
        in:['body'],
        exists:{
            errorMessage:'name field is required'
        },
        notEmpty:{
            errorMessage:'name field cannot be empty'
        },
        trim:true
    },
    email:{
        in:['body'],
        exists:{
            errorMessage:'email field is required'
        },
        notEmpty:{
            errorMessage:'email field cannot be empty'
        },
        trim:true,
        normalizeEmail:true,
        custom:{
            options:async function (value){
                try{
                    const user = await User.findOne({email:value})
                    if(user){
                        throw new Error('email already exists')
                    }
                }catch(err){
                    throw err
                }
                return true
            }
        }
    },
    password:{
        in:['body'],
        exists:{
            errorMessage:'password field is required'
        },
        notEmpty:{
            errorMessage:'password field cannot be empty'
        },
        trim:true,
        isStrongPassword:{
            options:{
                minLength:8,
                minLowerCase:1,
                minUpperCase:1,
                minNumber:1,
                minSymbol:1
            },
            errorMessage:'password must contain atleast 1 upperCase,1 LowerCase,1 Number,1 Symbol and more than 8 characters long'
        }
    },
    mobile:{
        in:['body'],
        exists:{
            errorMessage:'mobile field is required'
        },
        notEmpty:{
            errorMessage:'mobile field cannot be empty'
        },
        trim:true,
        isMobilePhone:{
            errorMessage:'mobile number is not valid'
        }
    },
    role:{
        in:['body'],
        custom:{
            options:async(value,{req})=>{
                const totalUser = await User.countDocuments()
                const allowedRoles = ['student','mentor']

                if(totalUser === 0){
                    return true
                }
                if(!value){
                    throw new Error('choose one role mentor or student')
                }
                if(value === 'admin'){
                    const existingAdmin = await User.findOne({role:'admin'})
                    if(existingAdmin){
                        throw new Error('Admin already exists')
                    }
                    return true
                }
                if(!allowedRoles.includes(value)){
                    throw new Error('Choose one role mentor or student')
                }
                return true
            }
        }
    }
}

export const userLoginValidationSchema = {
    email:{
        in:['body'],
        exists:{
            errorMessage:'email field is required'
        },
        notEmpty:{
            errorMessage:'email field cannot be empty'
        },
        trim:true,
        normalizeEmail:true,
        isEmail:{
            errorMessage:'email is not valid'
        }
    },
    password:{
        in:['body'],
        exists:{
            errorMessage:'password field is required'
        },
        notEmpty:{
            errorMessage:'password field should not be empty'
        },
        trim:true,
        isStrongPassword:{
            options:{
                minLength:8,
                minUpperCase:1,
                minLowerCase:1,
                minNumber:1,
                minSymbol:1
            },
            errorMessage:'password should be 8 character long and must contain atleast, one uppercase, one lowercase,one number and one symbol'
        }
    },
    // headers: {
    //     in: ['headers'],
    //     custom:{
    //         options:async(value,{req})=>{
    //             if(req.user.role !== 'admin'){
    //                 throw new Error('Unauthorized access')
    //             }
    //             return true
    //         }
    //     }
    // }
}
