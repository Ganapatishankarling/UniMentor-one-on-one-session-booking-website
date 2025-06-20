import React, { useState } from 'react'
import { isEmail } from 'validator'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../config/axios.jsx'
import { useDispatch } from 'react-redux'
import { login } from '../slices/userSlice.jsx'
import { AlertCircle, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const dispatch = useDispatch()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [clientErrors, setClientErrors] = useState({})
    const [serverErrors, setServerErrors] = useState(null)
    const navigate = useNavigate()

    const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
    };

    const handleSubmit = async(e) => {
        e.preventDefault()
        const errors = {}
        if(email.trim().length === 0) {
            errors.email = 'email is required'
        } else if(!isEmail(email)) {
            errors.email = 'please Provide valid email'
        }
        if(password.trim().length === 0) {
            errors.password = 'password is required'
        } else if(password.trim().length < 8 || password.trim().length > 128) {
            errors.password = 'password should be between 8 to 128 characters'
        }
        if(Object.entries(errors).length > 0) {
            setClientErrors(errors)
        } else {
            const formData = {
                email: email,
                password: password
            }
            try {
                const response = await axios.post("/login", formData)
                console.log(response.data)
                localStorage.setItem('token', response.data.token)
                const userResponse = await axios.get("/account", {headers: {Authorization: localStorage.getItem('token')}})
                console.log(userResponse.data)
                dispatch(login(userResponse.data))
                navigate('/profile')
            } catch(err) {
                setServerErrors(err.response.data.errors)
                setClientErrors({})
            }
        }
    }
    return(
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="mt-2 text-gray-600">Welcome back! Please enter your details</p>
          </div>
          
          {serverErrors && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                <h3 className="font-medium">These errors have prohibited the login:</h3>
              </div>
              <p className="ml-6 mt-2">{serverErrors}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-4">
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
                {clientErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{clientErrors.email}</p>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
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
                    placeholder="Enter your password"
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
            </div>
            
            <div>
              <button
                onClick={handleSubmit}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                </span>
                Sign In
              </button>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
}