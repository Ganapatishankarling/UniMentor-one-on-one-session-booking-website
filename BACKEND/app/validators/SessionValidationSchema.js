import Session from '../models/SessionModel.js';

export const sessionValidationSchema = {
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
        matches: {
            options: /^((0?[1-9])|(1[0-2])):([0-5][0-9])\s?(AM|PM)$/i,
            errorMessage: 'startTime must be in 12-hour format (hh:mm AM/PM)'
        },
        custom: {
            options: async (value, { req }) => {
                const inputDate = new Date(req.body.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
    
                if (inputDate.toDateString() === today.toDateString()) {
                    const [time, period] = value.trim().toUpperCase().split(' ');
                    const [hour12, minute] = time.split(':').map(Number);
                    let hour = hour12 % 12;
                    if (period === 'PM') hour += 12;
    
                    const inputStartTime = new Date();
                    inputStartTime.setHours(hour, minute, 0, 0);
    
                    const now = new Date();
                    if (inputStartTime < now) {
                        throw new Error('startTime must be in the future if date is today');
                    }
                }
                return true;
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
        matches: {
            options: /^((0?[1-9])|(1[0-2])):([0-5][0-9])\s?(AM|PM)$/i,
            errorMessage: 'endTime must be in 12-hour format (hh:mm AM/PM)'
        },
        custom: {
            options: async (value, { req }) => {
                // Convert both startTime and endTime to 24-hour minutes
                const [startTime, startPeriod] = req.body.startTime.trim().toUpperCase().split(' ');
                const [startHour12, startMinute] = startTime.split(':').map(Number);
                let startHour = startHour12 % 12;
                if (startPeriod === 'PM') startHour += 12;
    
                const [endTime, endPeriod] = value.trim().toUpperCase().split(' ');
                const [endHour12, endMinute] = endTime.split(':').map(Number);
                let endHour = endHour12 % 12;
                if (endPeriod === 'PM') endHour += 12;
    
                const start = startHour * 60 + startMinute;
                const end = endHour * 60 + endMinute;
    
                if (end <= start) {
                    throw new Error('endTime must be after startTime');
                }
    
                const inputDate = new Date(req.body.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
    
                if (inputDate.toDateString() === today.toDateString()) {
                    const inputEndTime = new Date();
                    inputEndTime.setHours(endHour, endMinute, 0, 0);
    
                    const now = new Date();
                    if (inputEndTime < now) {
                        throw new Error('endTime must be in the future if rescheduling today');
                    }
                }
                return true;
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
                const userRole = req.role
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
                const userRole = req.role
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

