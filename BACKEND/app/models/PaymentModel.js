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
    amount:{
        type:Number
    },
    currency:{
        type:String,
        default:'INR'
    },
    status:{
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