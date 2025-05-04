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
    mentorFee:{
        type:{type:Number,default:''},
    },
    education:{type:String,default:''},
    profileImage:{type:String,default:''},
    graduationYear:{type:Number,default:''},
    experience:{type:Number,default:''},
    forgotPasswordToken:String,
    forgotPasswordTokenExpiry:Date,
    isActive:{type:Boolean,default:false}
},{timestamps:true})
const UserModel = model('User',UserSchema)
export default UserModel