import {Schema,model} from 'mongoose';
const UserSchema = new Schema({
    name:String,
    email:String,
    password:String,
    mobile:Number,
    role:{type:String,enum:['admin','mentor','student']},
    university:{type:String,default:''},
    bio:{type:String,default:''},
    expertiseAreas:{type:String,default:''},
    education:{type:String,default:''},
    status:{type:String,enum:['pending','approved','rejected'],default:'pending'},
    profileImage:{type:String,default:''},
        isRejected:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:true
    },
    verifiedBadge:{
        type:String
    },
    
    graduationYear:{type:Number,default:''},
    experience:{type:Number,default:''},
    review:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    passwordResetToken:String,
    passwordResetExpiry:{type:Date},
    mentorIshAvailability:{type:Boolean,default:true},
    isActive:{type:String,default:"pending"}
},{timestamps:true})
const UserModel = model('User',UserSchema)
export default UserModel