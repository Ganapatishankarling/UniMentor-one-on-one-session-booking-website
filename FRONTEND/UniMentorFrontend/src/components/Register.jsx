import React,{useState} from 'react'
import {isEmail} from 'validator'
import {useNavigate} from 'react-router-dom'
import axios from '../config/axios.jsx'
import {AlertCircle,CheckCircle,User,Mail,Phone,Lock,ArrowRight,Eye,EyeOff} from 'lucide-react'

export default function Register(){
    const [name,setName]=useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [mobile,setMobile]=useState('')
    const [clientErrors,setClientErrors]=useState({})
    const [serverErrors,setServerErrors]=useState(null)
    const [role,setRole]=useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const toggleShowPassword = ()=>{
      setShowPassword(prev => !prev)
    }

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">Join our community and start your journey</p>
          </div>
          
          {serverErrors && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                <h3 className="font-medium">These errors prohibited the information from being saved:</h3>
              </div>
              <ul className="ml-6 mt-2 list-disc space-y-1">
                {serverErrors.map((err, i) => (
                  <li key={i}>{err.msg}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Create a password"
                  />
                  <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                </div>
                {clientErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{clientErrors.password}</p>
                )}
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-700">Select a role</span>
                <div className="mt-2 flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="mentor"
                      name="role"
                      type="radio"
                      checked={role === 'mentor'}
                      onChange={() => setRole('mentor')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="mentor" className="ml-2 block text-sm text-gray-700">
                      Mentor
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="student"
                      name="role"
                      type="radio"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="student" className="ml-2 block text-sm text-gray-700">
                      Student
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <button
                onClick={handleSubmit}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <CheckCircle className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                </span>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}