import {Schema,model} from 'mongoose';
const PaymentSchema = new Schema({
    sessionId:{
        type:Schema.Types.ObjectId
    },
    mentorId:{
        type:Schema.Types.ObjectId
    },
    studentId:{
        type:Schema.Types.ObjectId
    },
    currency:{
        type:String,
        default:'INR'
    },
    paymentStatus:{
        type:String,
        enum:['pending','completed','refunded'],
        default:'pending'
    },
    paymentMethod:{
        type:String,        
    },
    transactionId:{
        type:String
    }
},{timestamps:true})
const PaymentModel = model('Payment',PaymentSchema)
export default PaymentModel