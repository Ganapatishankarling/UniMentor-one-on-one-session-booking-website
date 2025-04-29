import {Schema,model} from 'mongoose';
const ReviewSchema = new Schema({
    sessionId:{
        type:Schema.Types.ObjectId
    },
    mentorId:{
        type:Schema.Types.ObjectId
    },
    studentId:{
        type:Schema.Types.ObjectId
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    comment:String
},{timestamps:true})
const ReviewModel = model('Review',ReviewSchema)
export default ReviewModel