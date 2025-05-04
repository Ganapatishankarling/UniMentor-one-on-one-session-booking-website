import React from 'react'
import {useState} from 'react'
import {isEmail} from 'validator'
import {useNavigate} from 'react-router-dom'
import axios from '../config/axios.jsx'
import {useDispatch} from 'react-redux'
import {login} from '../slices/userSlice.jsx'

export default function Login(){
    const dispatch = useDispatch()
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [clientErrors,setClientErrors]=useState({})
    const [serverErrors,setServerErrors]=useState(null)
    const navigate = useNavigate()
    const handleSubmit = async(e)=>{
        e.preventDefault()
        const errors={}
        if(email.trim().length===0){
            errors.email='email is required'
        }else if(!isEmail(email)){
            errors.email='please Provide valid email'
        }
        if(password.trim().length===0){
            errors.password='password is required'
        }else if(password.trim().length<8 || password.trim().length>128){
            errors.password='password should be between 8 to 128 characters'
        }
        if(Object.entries(errors).length>0){
            setClientErrors(errors)
        }else{
            const formData = {
                email:email,
                password:password
            }
            try{
                const response = await axios.post("/login",formData)
                console.log(response.data)
                localStorage.setItem('token',response.data.token)
                const userResponse = await axios.get("/account",{headers:{Authorization:localStorage.getItem('token')}})
                console.log(userResponse.data)
                dispatch(login(userResponse.data))
                navigate('/account')
            }catch(err){
                setServerErrors(err.response.data.errors)
                setClientErrors({})
            }
        }
    }
    return(
        <div>
            <h2>Login here</h2>
            {serverErrors && (
                <div>
                    <h3>These error/s have prohibited the information from being saved</h3>
                    <ul>
                        {serverErrors.map ((err,i)=>{
                            return <li key={i}>{err.msg}</li>
                        })}
                    </ul>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Enter your email:</label><br/>
                    <input type="text" value={email} onChange={(e)=>{
                        setEmail(e.target.value)
                    }}id="email"/>
                    {clientErrors.email && <p>{clientErrors.email}</p>}
                </div>
                <div>
                    <label htmlFor="password">Enter your password:</label><br/>
                    <input type="password" value={password} onChange={(e)=>{
                        setPassword(e.target.value)
                    }} id="password"/>
                    {clientErrors.password && <p>{clientErrors.password}</p>}
                </div>
                <div>
                    <input type="submit"/>
                </div>
            </form>           
        </div>
    )
}