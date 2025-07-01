import {validationResult} from 'express-validator';
import User from '../models/UserModel.js';
import crypto from 'crypto'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {sendResetPasswordEmail} from '../nodemailer/emails.js'

const userController = {}

userController.list = async(req,res)=>{
    try{
        const { search, expertise, role } = req.query;
        // Build the filter object
        let filter = {};
        
        // Get user role from token (assuming you have middleware that sets req.user)
        const userRole = req.user?.role;
        
        // If user is a student, only show mentors
        if (userRole === 'student') {
            filter.role = 'mentor';
            filter.isActive = 'approved'; // Only show approved mentors to students
        } else {
            // For non-students (admin, mentors), allow role filtering
            if (role) {
                filter.role = role;
            }
        }
        
        // Add search functionality
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
            filter.$or = [
                { name: searchRegex },
                { bio: searchRegex },
                { university: searchRegex },
                { expertiseAreas: searchRegex }
            ];
        }
        
        // Filter by expertise area
        if (expertise && expertise !== 'All') {
            filter.expertiseAreas = new RegExp(expertise.trim(), 'i');
        }
        
        const users = await User.find(filter);
        return res.json(users);
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'Something went wrong'})
    }
}

userController.listById = async(req,res)=>{
    try {
        const users = await User.findById(req.params.id)
        if(!users) return res.status(200).json({error:"User not found"})
        res.json(users)
    } catch (err) {
        console.log(err)
    }
}

userController.register = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {name,email,password,mobile,role,passcode} = req.body;
       
    try{
        const user = new User({name,email,password,mobile,role})
        if(role == 'student' || role == 'admin'){
            user.isActive = "approved"
        }else{
            user.isActive = "pending"
        }

        if(user.role === "admin" && passcode != "AdminPass"){
            return res.status(401).json({message:'Enter valid passcode'})
        }
        const salt = await bcryptjs.genSalt()
        const hashedPassword = await bcryptjs.hash(password, salt);
        user.password = hashedPassword;

        await user.save();

        return res.status(201).json(user);
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:err.message})
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

        if(!user.isVerified){
            return res.json({message:"please verify your account"})
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
        await user.save()
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
  const {email} = req.body;
  try{
     const user = await User.findOne({email});
     if(!user){
      return res.status(404).json({error:"user not found"});
     }

     // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
    
      sendResetPasswordEmail({token:resetToken,email:user.email});
     // Hash it before storing in DB for security
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
     console.log("tk",hashedToken);
     
     // Set expiry time (e.g., 5 minutes from now)
      const tokenExpiry =new Date(Date.now() + 5 * 60 * 1000);  // 5 mins

     // Save to user document (example)
      user.passwordResetToken = hashedToken;
      user.passwordResetExpiry = tokenExpiry;

      await user.save();
      return res.json({success:true,message:`reset token has be sent your ${user.email}`});

  }catch(error){
    console.log(error)
    return res.status(500).json({success:false,message:"internal server error"})
  }
}

//reset password
userController.resetPassword = async(req,res)=>{
  const { token, newPassword } = req.body;
  try {
    console.log("tokem",token);
    
      // Hash token to match what was stored
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        // Find user with matching token and check expiry
        console.log("hgasj",hashedToken);
        
        const user = await User.findOne({
           passwordResetToken: hashedToken,
           passwordResetExpiry: { $gt:  new Date() }
         });
console.log("user",user);

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Update password and clear reset fields
       const salt = await bcryptjs.genSalt();
       const hashedPassword = await bcryptjs.hash(newPassword,salt);
       user.password = hashedPassword;
       user.passwordResetToken = undefined;
       user.passwordResetExpiry  = undefined;
       await user.save();
       return res.json({success:true,message:'password chenged succefully'})
  } catch (error) {
    console.log(error)
    return res.status(500).json({success:false,message:"internal server error"})
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

userController.updateMentorIsActive = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        
        if (!user) {
            return res.status(404).json({ errors: 'User not found' });
        }
        const status = req.body.status
        user.mentorIshAvailability = status
        await user.save()
         res.json({message:'Status changed successfully'})
    } catch (error) {
         console.log(error)
        res.status(500).json({errors:'Something went wrong'})
    }
}


userController.updateAdminApproval = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        
        if (!user) {
            return res.status(404).json({ errors: 'User not found' });
        }
        const status = req.body.status
        user.isActive = status
        await user.save()
         return res.json({message:'Admin Status changed successfully',details:user})
    } catch (error) {
         console.log(error)
        res.status(500).json({errors:'Something went wrong',message:error.message})
    }
}

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