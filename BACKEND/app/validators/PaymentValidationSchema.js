export const paymentValidationSchema = {
    sessionId:{
        in:['body'],
        isMongoId:{
            errorMessage:'invalid sessionId'
        },
        notEmpty:{
            errorMessage:'sessionId cannot be empty'
        }
    },
    mentorId:{
        in:['body'],
        isMongoId:{
            errorMessage:'invalid mentroId'
        },
        notEmpty:{
            errorMessage:'mentorId cannot be empty'
        }
    },
    studentId:{
        in:['body'],
        isMongoId:{
            errorMessage:'invalid studentId'
        },
        notEmpty:{
            errorMessage:'studentId cannot be empty'
        }
    },
    amount:{
        in:['body'],
        isFloat:{
            options:{gt:0},
            errorMessage:'Amount must be greater than 0'
        },
        notEmpty:{
            errorMessage:'amount cannot be empty'
        }
    },
    currency:{
        in:['body'],
        optional:true,
        isString:{
            errorMessage:'currency must be string'
        },
        isIn:{
            option:['INR'],
            errorMessage:'Currency must be INR'
        }
    },
    paymentStatus:{
        in:['body'],
        optional:true,
        isString:true,
        isIn:{
            options:[['pending','completed','refunded']],
            errorMessage:'Status must be pending,completed or refunded'
        },
        custom:{
            options:async(value,{req})=>{
                const userRole = req.user?.role

                if(userRole !== 'admin'){
                    throw new Error('only admin can update payment status')
                }

                const validPaymentStatus = ['pending','completed','refunded']
                if(!validPaymentStatus.includes(value)){
                    throw new Error('choose one payment status')
                }
                return true
            }
        }
    },
    paymentMethod:{
        in:['body'],
        notEmpty:{
            errorMessage:'paymentMethod is required'
        },
        isString:{
            errorMesssage:'payment method must be a string'
        },
        isIn:{
            options:[['card','upi']],
            errorMessage:'choose one payment method'
        }
    },
    transactionId:{
        in:['body'],
        notEmpty:{
            errorMessage:'Transaction ID is required'
        },
        isString:{
            errorMessage:'Transaction ID must be a string'
        }
    }
}

