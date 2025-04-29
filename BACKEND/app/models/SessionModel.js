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
    endTime:String,
    status:{
        type:String,
        enum:['pending','confirmed','completed','cancelled'],
        default:'pending'
    },
    topic:{
        type:String
    },
    meetingLink:String,
    paymentStatus:{
        type:String,
        enum:['pending','completed','refunded'],
        default:'pending'
    }
},{timestamps:true})
const SessionModel = model('Session',SessionSchema)
export default SessionModel