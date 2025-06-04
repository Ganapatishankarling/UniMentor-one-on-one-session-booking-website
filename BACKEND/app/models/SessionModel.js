import {Schema,model} from 'mongoose';
const SessionSchema = new Schema({
    mentorId:{
        type:Schema.Types.ObjectId
    },
    studentId:{
        type:Schema.Types.ObjectId
    },
    date:Date,
    startTime:String,
    sessionFee:{type:String,default:"0"},
    endTime:String,

    duration: {
        type: Number, 
        default: 60,  
        min: 15,      
        max: 120    
    },
    
    status:{
        type:String,
        enum:['pending','completed'],
        default:'pending'
    },
    topic:{
        type:String
    },
    meetingLink:String,
    slot:[{slotTime:String,availability:Boolean}]
},{timestamps:true})
const SessionModel = model('Session',SessionSchema)
export default SessionModel