import {validationResult} from 'express-validator';
import User from '../models/UserModel.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../nodemailer/nodemailer.js';


const userController = {}

userController.list = async(req,res)=>{
    try{
        const users = await User.find()
        return res.json(users)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'Something went wrong'})
    }
}

userController.register = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {name,email,password,mobile,role} = req.body;
       
    try{
        const totalUser = await User.countDocuments() 
        const newUser = new User({
            name,
            email,
            mobile
        })
        newUser.role = totalUser === 0 ? 'admin' : role

        const salt = await bcryptjs.genSalt()
        newUser.password = await bcryptjs.hash(password,salt)        

        newUser.isActive = totalUser === 0 || role === 'student';        

        await newUser.save()

        await sendEmail(
            email,
            'welcome to UniMentor',
            `Hi ${name},welcome to UniMentor we are excited to have you here`
        )
        return res.json(newUser)        
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'Something went wrong'})
    }
}

userController.login = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({error:'Invalid email or password'})
        }
        const isMatch = await bcryptjs.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({errors:'Invalid email or password'})
        }
        const tokenData = {
            userId:user._id,
            role:user.role
        }
        const token = jwt.sign(tokenData,'Ganapati@123',{expiresIn:'7d'})
        return res.json({token})
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'Something went wrong'})
    }
}

userController.account = async(req,res)=>{
    const userId = req.userId
    try{
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({errors:'User not found'})
        }
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'Something went wrong'})
    }
}

userController.forgotPassword = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,newPassword} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({errors:'User not found'})
        }
        const salt = await bcryptjs.genSalt()
        user.password = await bcryptjs.hash(newPassword,salt)
        await user.save()

        res.json({message:'Password reset successfully'})
    }catch(err){
        console.logh(err)
        res.status(500).json({errors:'Something went wrong'})
    }
}

userController.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;
    const updateData = { ...req.body };

    if (req.file) {
        updateData.profileImage = `/uploads/profileImages/${req.file.filename}`;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ errors: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

userController.remove = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id
    try {
        const deletedUser = await User.findByIdAndDelete(id)

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(deletedUser);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
export default userController