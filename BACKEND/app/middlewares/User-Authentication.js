import jwt from 'jsonwebtoken'
export async function userAuthentication(req,res,next){
    let token = req.headers['authorization']
    if(!token){
        return res.status(401).json({error:'unauthorized access'})
    }
    try{
        const tokenData = jwt.verify(token,'Ganapati@123')
        
        req.userId=tokenData.userId,
        req.role=tokenData.role
        
        console.log(tokenData.role)
        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({error:'Unauthorized Access'})
    }
}