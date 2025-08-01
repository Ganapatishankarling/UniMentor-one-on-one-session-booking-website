import {validationResult} from 'express-validator';
import Session from '../models/SessionModel.js';
import User from '../models/UserModel.js';
import AvailabilityModel from '../models/AvailabilityModel.js';

const sessionController = {}
function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


sessionController.list = async(req,res)=>{
    try{
        const user = await User.findOne({_id: req.userId}) // Fixed: use findOne instead of find
        console.log(req.userId)
        if(!user){
            return res.status(400).json({errors:'user not found'})
        }
        
        let filter = {}
        if(req.role==='mentor') filter.mentorId = user._id
        if(req.role==='student') filter.studentId = user._id
        
        const sortOption = req.role == 'admin' ? {createdAt:-1} : {createdAt:1}
        
        // Populate mentor information to get mentor's name
        const session = await Session.find(filter)
            .populate('mentorId', 'name email') // Add fields you want from mentor
            .populate('studentId', 'name')
            
            .sort(sortOption)
         if (req.role === 'student') {
        //     console.log("role",req.role);
            
          await Promise.all(
        session.map(async (s) => {
          const availability = await AvailabilityModel.findOne({
            mentorId: s.mentorId?._id
          });
          console.log("aca",s);
          
          s._doc.availability = availability || null;
        })
      );  
         }

        // Unified response
        return res.json({
            session,
            
        });
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'something went wrong'})
    }
}
sessionController.listSessionById = async(req,res)=>{
    try {
        const sessions = await Session.find({mentorId:req.params.id}).populate({path:'mentorId',select:'name'});
        console.log("ses",sessions);
       

        return res.json(sessions)
    } catch (error) {
          return res.status(500).json({errors:'something went wrong',mesg:error?.message})
    }
}
sessionController.listStudentSessionById = async(req, res) => {
  try {
    // Get the current student's ID from the authenticated user
    const studentId = req.params.id;
    
    // Find sessions where this student is registered
    const sessions = await Session.find({ 
     
      studentId: studentId
    }).populate({path:'mentorId',select:'name'});


     const date = new Date()
            const updateSessionStatus = await Promise.all(sessions.map(async(session)=>{
            const datePart = new Date(session.date).toISOString().split('T')[0]; // "2025-05-16"
    const endTime24 = convertTo24Hour(session.endTime); // e.g., "22:53"
    const endDateTime = new Date(`${datePart}T${endTime24}:00`); 
            
           const shouldBeCompleted = date > endDateTime;

    // Update only if needed
    if (shouldBeCompleted && session.status !== 'completed') {
        session.status = 'completed';
        await session.save();
    } else if (!shouldBeCompleted && session.status === 'completed') {
        session.status = 'pending'; // Optional: reset to pending if somehow marked completed early
        await session.save();
    }
            return session
        }))
    
    return res.json(updateSessionStatus);
  } catch (error) {
    return res.status(500).json({ errors: 'something went wrong', mesg: error?.message });
  }
}

sessionController.create = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const session = new Session({mentorId:req.params.id,...req.body})
      
        await session.save()
        return res.status(201).json(session)
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'something went wrong'})
    }
}



sessionController.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;
  const { date, startTime, endTime } = req.body;

  try {
    const existingSession = await Session.findById(id);
    if (!existingSession) {
      return res.status(404).json({ errors: 'Session not found' });
    }

    // Validate time logic
    const convertTimeToMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    if (startTime && endTime) {
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = convertTimeToMinutes(endTime);
      if (endMinutes <= startMinutes) {
        return res.status(400).json({ errors: 'End time must be after start time' });
      }
    }

    // If date/time changed, save old slot to history
    const rescheduleEntry = {
      previousDate: existingSession.date,
      previousStartTime: existingSession.startTime,
      previousEndTime: existingSession.endTime,
      rescheduledAt: new Date()
    };

    // push to rescheduleHistory array (create if not exist)
    existingSession.rescheduleHistory = existingSession.rescheduleHistory || [];
    existingSession.rescheduleHistory.push(rescheduleEntry);

    // Update new date/time
    existingSession.date = date;
    existingSession.startTime = startTime;
    existingSession.endTime = endTime;

    // If booked → mark as rescheduled
    if (existingSession.status === 'booked') {
      existingSession.status = 'rescheduled';
    }

    await existingSession.save();

    return res.json({
      message: 'Session updated & reschedule history saved',
      session: existingSession,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: 'Something went wrong' });
  }
};

sessionController.reschedule = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id = req.params.id
    const {date,startTime,endTime,duration}=req.body
    try{
        const session = await Session.findByIdAndUpdate(id,{date,startTime,endTime,duration},{new:true})
        if(!session){
            return res.status(404).json({errors:'Session not found'})
        }
        session.date = date
        session.startTime = startTime
        session.endTime = endTime
        session.duration = duration 
        await session.save()
        
        return res.json(session)
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'something went wrong'})
    }
}

sessionController.delete = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const id = req.params.id
    
    try {
        const session = await Session.findById(id)
        
        if(!session){
            return res.status(404).json({errors: 'Session not found'})
        }
        
        // Only allow deletion of completed or cancelled sessions
        if(session.status !== 'completed' && session.status !== 'cancelled'){
            return res.status(400).json({errors: 'Can only delete completed or cancelled sessions'})
        }
        
        await Session.findByIdAndDelete(id)
        return res.json({message: 'Session deleted successfully'})
    } catch(err) {
        console.log(err)
        return res.status(500).json({errors: 'Something went wrong'})
    }
}

sessionController.cancel = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id = req.params.id
    try{
        const session = await Session.findByIdAndUpdate(id,{status:'cancelled'},{new:true})
        if(!session){
            return res.status(404).json({errors:'Session not found'})
        }
        return res.json(session)
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'something went wrong'})
    }
}

export default sessionController