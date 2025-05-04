import React from 'react'
import {useState} from 'react'
import {isEmail} from 'validator'
import {useNavigate} from 'react-router-dom'
import axios from '../config/axios.jsx'

export default function Register(){
    const [name,setName]=useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [mobile,setMobile]=useState('')
    const [clientErrors,setClientErrors]=useState({})
    const [serverErrors,setServerErrors]=useState(null)
    const [role,setRole]=useState('')
    const navigate = useNavigate()
    const handleSubmit = async(e)=>{
        e.preventDefault()
        const errors={}
        if(email.trim().length===0){
            errors.email='email is required'
        }else if(!isEmail(email)){
            errors.email='please provide valid email'
        }
        if(password.trim().length===0){
            errors.password='passsword is required'
        }else if(password.trim().length<8 || password.trim().length>128){
            errors.password='password should be between 8 to 128 characters'
        }
        if(Object.entries(errors).length>0){
            setClientErrors(errors)
        }else{
            const formData = {
                name:name,
                email:email,
                mobile:mobile,
                password:password,
                role:role
            }
            try{
                const response = await axios.post("/register",formData)
                navigate('/login')
            }catch(err){
                setServerErrors(err.response.data.errors)
                setClientErrors({})
            }
        }
    }
    return(
        <div>
            <h2>Create your account</h2>
            {serverErrors && (
                <div>
                    <h3>These error/s prohibited the information from being saved</h3>
                    <ul>
                        {serverErrors.map((err,i)=>{
                            return <li key={i}>{err.msg}</li>
                        })}
                    </ul>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div>
                    <div>
                        <label htmlFor="name">Enter your name:</label>
                        <input type="text" value={name} onChange={(e)=>{
                            setName(e.target.value)
                        }} id="name"/>
                    </div>
                    <div>
                        <label htmlFor='email'>Enter your email:</label>
                        <input type="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} id="email"/>                        
                    </div>
                    <div>
                        <label htmlFor="mobile">Enter your mobile:</label>
                        <input type="text" value={mobile} onChange={(e)=>{setMobile(e.target.value)}} id="mobile"/>                        
                    </div>
                    <div>
                        <label htmlFor='password'>Enter your password:</label>
                        <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} id="password"/>    
                        {clientErrors.password && <p>{clientErrors.password}</p>}                    
                    </div>
                    <div>
                        <label>Select a role:</label>
                        <input type="radio" id="seller" name="role" checked={role==='mentor'} onChange={()=>{setRole('mentor')}}/><label htmlFor="mentor">Mentor</label>
                        <input type="radio" id="seller" name="role" checked={role==='student'} onChange={()=>{setRole('student')}}/><label htmlFor="student">Student</label>
                    </div>
                    <input type="submit"/>
                </div>
            </form>
        </div>
    )
}