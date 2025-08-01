export const userAuthorization = (permittedRoute)=>{
  
    
    return (req,res,next)=>{
        if(permittedRoute.includes(req.role)){
            next()
        }else{
            return res.status(403).json({error:'Unauthorized Access'})
        }
    }
}