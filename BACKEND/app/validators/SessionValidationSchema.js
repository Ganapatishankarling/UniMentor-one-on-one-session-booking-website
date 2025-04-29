import Session from '../models/SessionModel.js';

export const sessionValidationSchema = {
    mentorId:{
        in:['body'],
        exists:{
            errorMessage:'mentorId field is required'
        },
        notEmpty:{
            errorMessage:'mentorId field cannot be empty'
        },
        trim:true,
        isMongoId:{
            errorMessage:'mentorId must be a valid mongoId'
        }
    },
    studentId:{
        in:['body'],
        exists:{
            errorMessage:'studentId field is required'
        },
        notEmpty:{
            errorMessage:'studentId field cannot be empty'
        },
        trim:true,
        isMongoId:{
            errorMessage:'studentId must be a valid mongoId'
        }
    },
    date:{
        in:['body'],
        exists:{
            errorMessage:'date field is required'
        },
        notEmpty:{
            errorMessage:'date field cannot be empty'
        },
        trim:true,
        isISO8601:{
            errorMessage:'date must be valid ISO8601 date'
        },
        custom:{
            options:async(value)=>{
                const inputDate = new Date(value)
                const today = new Date()
                today.setHours(0,0,0,0)

                if(inputDate < today){
                    throw new Error('date must be today or greater then today')
                }
                return true
            }
        }
    },
    startTime:{
        in:['body'],
        exists:{
            errorMessage:'startTime field is required'
        },
        notEmpty:{
            errorMessage:'startTime field cannot be empty'
        },
        trim:true,
        custom:{
            options:async(value,{req})=>{
                const inputDate = new Date(req.body.date)
                const today = new Date()
                today.setHours(0,0,0,0)

                if(inputDate.toDateString() === today.toDateString()){
                    const [hours,minutes] = value.split(':').map(Number)
                    const inputStartTime = new Date()
                    inputStartTime.setHours(hours,minutes,0,0)

                    const now = new Date()

                    if(inputStartTime < now){
                        throw new Error('startTime must be in the future if date is today')
                    }
                }
                return true
            }
        }
    },
    endTime:{
        in:['body'],
        exists:{
            errorMessage:'endTime field is required'
        },
        notEmpty:{
            errorMessage:'endTime field cannot be empty'
        },
        trim:true,
        custom:{
            options:async(value,{req}) =>{
                const [startHours,startMinutes] = req.body.startTime.split(':').map(Number)
                const [endHours,endMinutes] = value.split(':').map(Number)

                const start = startHours * 60 + startMinutes
                const end = endHours * 60 + endMinutes

                if(end <= start){
                    throw new Error('endTime must be after startTime')
                }

                const inputDate = new Date(req.body.date)
                const today = new Date()
                today.setHours(0,0,0,0)

                if(inputDate.toDateString() === today.toDateString()){
                    const [hours,minutes] = value.split(':').map(Number)
                    const inputEndTime = new Date()
                    inputEndTime.setHours(hours,minutes,0,0)

                    const now = new Date()

                    if(inputEndTime < now){
                        throw new Error('endTime must be in the future if rescheduling today')
                    }
                }
            }
        }
    },
    topic:{
        in:['body'],
        exists:{
            errorMessage:'topic field is required'
        },
        notEmpty:{
            errorMessage:'topic field cannot be empty'
        },
        trim:true
    },
    status:{
        in:['body'],
        custom:{
            options:async (value,{req})=>{
                const userRole = req.user?.role
                const allowedRoles = ['admin','mentor']
                if(!allowedRoles.includes(userRole)){
                    throw new Error('only mentor and admin can update status')
                }
                const validStatus = ['pending','confirmed','completed','cancelled']
                if(!validStatus.includes(value)){
                    throw new Error('choose one status')
                }
                return true
            }
        }
    },
    meetingLink:{
        in:['body'],
        trim:true,
        custom:{
            options:async (value,{req})=>{
                const userRole = req.user?.role
                const allowedRoles = ['admin','mentor']

                if(!allowedRoles.includes(userRole)){
                    throw new Error('only mentor and admin can update meeting Link')
                }
                try{
                    new URL(value)
                }catch(err){
                    throw new Error('meetingLink must valid URL')
                }
                return true
            }
        }
    },
    
}

