import {Schema,model} from 'mongoose';
const SessionSchema = new Schema({
    mentorId:{
        type:Schema.Types.ObjectId,ref:"User"
    },
    studentId:{
        type:Schema.Types.ObjectId,ref:"User"
    },
    date:Date,
    startTime:String,
    sessionFee:{type:String,default:"0"},
    endTime:String,
    duration: {
        type: Number, 
        default: 60,  
        min: 30,      
        max: 120    
    },
    
    status:{
        type:String,
        enum:['pending','completed','cancelled'],
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