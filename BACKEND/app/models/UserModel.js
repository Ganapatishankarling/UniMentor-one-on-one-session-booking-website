import {Schema,model} from 'mongoose';
const UserSchema = new Schema({
    name:String,
    email:String,
    password:String,
    mobile:Number,
    role:{type:String,enum:['admin','mentor','student']},
    university:String,
    bio:String,
    expertiseAreas:String,
    mentorFee:{
        type:Number
    },
    education:String,
    profileImage:String,
    forgotPasswordToken:String,
    forgotPasswordTokenExpiry:Date,
    isActive:{type:Boolean,default:false}
},{timestamps:true})
const UserModel = model('User',UserSchema)
export default UserModel