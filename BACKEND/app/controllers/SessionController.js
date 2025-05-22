import {validationResult} from 'express-validator';
import Session from '../models/SessionModel.js';
import User from '../models/UserModel.js';

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
            .populate('mentorId', 'username email') // Add fields you want from mentor
            .sort(sortOption)
            
        return res.json(session)
    }catch(err){
        console.log(err)
        return res.status(500).json({errors:'something went wrong'})
    }
}
sessionController.listSessionById = async(req,res)=>{
    try {
        const sessions = await Session.find({mentorId:req.params.id})
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
    });
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
    console.log("student sessions", updateSessionStatus);
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

sessionController.update=async(req,res)=>{
    const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const id = req.params.id
        const {status,date,startTime,endTime,topic,studentId} = req.body

        try{
            const session = await Session.findById(id)
            if(!session){
                return res.status(400).json({errors:'Session not found'})
            }
//             const updateData = Object.entries({status,date,startTime,endTime,topic,studentId})
//             .filter(({_, value})=> value !== undefined)
//             .reduce((acc, [key, value])=> ({ ...acc,[key]:value}),{})
// console.log("up",updateData);

            const updatedSession = await Session.findByIdAndUpdate(id,{studentId:req.body.studentId,...req.body},{new:true})
            return res.json(updatedSession)
        }catch(err){
            console.log(err)
            return res.status(500).json({errors:'Something went wrong'})
        }
    }


    // sessionController.book = async (req, res) => {
    //     try {
    //       const user = req.user;
    //       const sessionId = req.params.id;
          
    //       // Quick validation for authentication and role
    //       if (!user || user.role !== 'student') {
    //         return res.status(!user ? 401 : 403).json({ 
    //           success: false, 
    //           errors: !user ? 'Not authenticated' : 'Only students can book sessions' 
    //         });
    //       }
      
    //       const session = await Session.findById(sessionId);
          
    //       if (!session) {
    //         return res.status(404).json({ success: false, errors: 'Session not found' });
    //       }
          
    //       const validationErrors = validateSessionBooking(session, user.id);
    //       if (validationErrors) {
    //         return res.status(400).json({ success: false, errors: validationErrors });
    //       }
          
    //       Object.assign(session, {
    //         studentId: user.id,
    //         studentName: user.name || user.username || 'Student',
    //         status: session.status === 'pending' ? 'confirmed' : session.status
    //       });
          
    //       await session.save();
          
    //       // await createInstructorNotification(session);
          
    //       return res.status(200).json({
    //         success: true,
    //         message: 'Session booked successfully',
    //         data: session
    //       });
          
    //     } catch (error) {
    //       console.error('Error booking session:', error);
    //       return res.status(500).json({
    //         success: false,
    //         errors: 'Server error while booking session'
    //       });
    //     }
    //   };

// sessionController.updateStatus = async(req,res)=>{
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     const id = req.params.id
//     const {status} = req.body
//     try{
//         const session = await Session.findByIdAndUpdate(id,{status},{new:true})

//         if(!session){
//             return res.status(404).json({errors:'Session not found'})
//         }
//         return res.json(session)
//     }catch(err){
//         console.log(err)
//         return res.status(500).json({errors:'something went wrong'})
//     }
// }

// sessionController.reschedule = async(req,res)=>{
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     const id = req.params.id
//     const {date,startTime,endTime}=req.body
//     try{
//         const session = await Session.findByIdAndUpdate(id,{date,startTime,endTime},{new:true})
//         if(!session){
//             return res.status(404).json({errors:'Session not found'})
//         }
//         session.date = date
//         session.startTime = startTime
//         session.endTime = endTime
//         await session.save()
        
//         return res.json(session)
//     }catch(err){
//         console.log(err)
//         return res.status(500).json({errors:'something went wrong'})
//     }
// }

// sessionController.updateTopic = async(req,res)=>{
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({error:errors.array()})
//     }
//     const id = req.params.id
//     const {topic} = req.body
//     try{
//         const session = await Session.findByIdAndUpdate(id,{topic},{new:true})
//         if(!session){
//             return res.status(404).json({errors:'Session not found'})
//         }
//         session.topic = topic
//         await session.save()
//         return res.json(session)
//     }catch(err){
//         console.log(err)
//         return res.status(500).json({errors:'something went wrong'})
//     }
// }

// sessionController.updateMeetingLink = async(req,res)=>{
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     const id = req.params.id
//     const {meetingLink} = req.body
//     try{
//         const session = await Session.findByIdAndUpdate(id,{meetingLink},{new:true})
//         if(!session){
//             return res.status(404).json({errors:'Session not found'})
//         }
//         session.meetingLink=meetingLink
//         await session.save()

//         return res.json(session)
//     }catch(err){
//         console.log(err)
//         return res.status(500).json({errors:'something went wrong'})
//     }
// }

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
