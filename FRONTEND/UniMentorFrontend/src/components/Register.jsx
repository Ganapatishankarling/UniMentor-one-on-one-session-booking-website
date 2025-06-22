import React,{useState} from 'react'
import {isEmail} from 'validator'
import {useNavigate} from 'react-router-dom'
import axios from '../config/axios.jsx'
import {AlertCircle,CheckCircle,User,Mail,Phone,Lock,ArrowRight,Eye,EyeOff,Key,X,Shield} from 'lucide-react'

export default function Register(){
    const [name,setName]=useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [mobile,setMobile]=useState('')
    const [clientErrors,setClientErrors]=useState({})
    const [serverErrors,setServerErrors]=useState(null)
    const [role,setRole]=useState('')
    const [code, setCode] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [registrationData, setRegistrationData] = useState(null)
    const [successMessage, setSuccessMessage] = useState('')
    const navigate = useNavigate()

    const toggleShowPassword = ()=>{
      setShowPassword(prev => !prev)
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        const errors={}
        
        // Validation
        if(name.trim().length === 0){
            errors.name = 'Name is required'
        }
        if(email.trim().length===0){
            errors.email='email is required'
        }else if(!isEmail(email)){
            errors.email='please provide valid email'
        }
        if(mobile.trim().length === 0){
            errors.mobile = 'Mobile number is required'
        }
        if(password.trim().length===0){
            errors.password='password is required'
        }else if(password.trim().length<8 || password.trim().length>128){
            errors.password='password should be between 8 to 128 characters'
        }
        if(role.trim().length === 0){
            errors.role = 'Please select a role'
        }
        if(role === 'admin' && code.trim().length === 0){
            errors.code = 'Admin passcode is required'
        }

        if(Object.entries(errors).length>0){
            setClientErrors(errors)
            return
        }

        // Store registration data for later use
        const formData = {
            name:name,
            email:email,
            mobile:mobile,
            password:password,
            role:role,
            passcode:code
        }
        setRegistrationData(formData)

        // Send OTP
        setIsLoading(true)
        try{
            const response = await axios.post("/sendOtp", {email})
            console.log(otp)
            setShowOtpModal(true)
            setClientErrors({})
            setServerErrors(null)
        }catch(err){
            setServerErrors(err.response?.data?.message || 'Failed to send OTP')
            setClientErrors({})
        }finally{
            setIsLoading(false)
        }
    }

    const handleOtpVerification = async(e) => {
        e.preventDefault()
        if(otp.trim().length === 0){
            setOtpError('OTP is required')
            return
        }
        if(otp.trim().length !== 6){
            setOtpError('OTP must be 6 digits')
            return
        }

        setIsLoading(true)
        try {
    // Verify OTP
   const res = await axios.post("/verifyOtp", {
        email: registrationData.email,
        otp: otp
    });
    console.log('res',res)

    // If OTP is verified, proceed with registration
   const response = await axios.post("/register", registrationData);
   console.log('response',response)
    
    setSuccessMessage('Registration complete! Account verified successfully.');
    setOtpError('');

    setTimeout(() => {
        navigate('/login');
    }, 2000);
} catch (err) {
    closeOtpModal()
    setOtpError(err.response?.data?.errors || 'Invalid or expired OTP');
    console.log('err',err)
} finally {
    setIsLoading(false);
}

    }

    const closeOtpModal = () => {
        setShowOtpModal(false)
        setOtp('')
        setOtpError('')
        setSuccessMessage('')
    }

    const resendOtp = async() => {
        setIsLoading(true)
        try{
            await axios.post("/sendOtp", {email: registrationData.email})
            setOtpError('')
            // You could show a success message here
        }catch(err){
            setOtpError('Failed to resend OTP')
        }finally{
            setIsLoading(false)
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
                            <span className="font-medium">{serverErrors}</span>
                        </div>
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
                            {clientErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{clientErrors.name}</p>
                            )}
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
                            {clientErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{clientErrors.email}</p>
                            )}
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
                            {clientErrors.mobile && (
                                <p className="mt-1 text-sm text-red-600">{clientErrors.mobile}</p>
                            )}
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
                            <div className="mt-2 flex flex-wrap gap-4">
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
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="admin"
                                        name="role"
                                        checked={role === "admin"}
                                        onChange={() => setRole('admin')}
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="admin" className="ml-2 block text-sm text-gray-700">
                                        Admin
                                    </label>
                                </div>
                            </div>
                            {clientErrors.role && (
                                <p className="mt-1 text-sm text-red-600">{clientErrors.role}</p>
                            )}
                            
                            {role === "admin" && (
                                <div className="mt-3">
                                    <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">
                                        Admin Passcode
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <Key className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="password"
                                            id="passcode"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Enter admin passcode"
                                        />
                                    </div>
                                    {clientErrors.code && (
                                        <p className="mt-1 text-sm text-red-600">{clientErrors.code}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <CheckCircle className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                            </span>
                            {isLoading ? 'Sending OTP...' : 'Create Account'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Verify Your Email</h3>
                            <button
                                onClick={closeOtpModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {successMessage ? (
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-green-600 text-lg font-medium">{successMessage}</p>
                                <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-4">
                                    We've sent a 6-digit verification code to <strong>{registrationData?.email}</strong>
                                </p>
                                
                                {otpError && (
                                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
                                        <div className="flex items-center">
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            <span className="text-sm">{otpError}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleOtpVerification}>
                                    <div className="mb-4">
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                            Enter Verification Code
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <Shield className="h-5 w-5" />
                                            </span>
                                            <input
                                                type="text"
                                                id="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center text-lg tracking-widest"
                                                placeholder="000000"
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </form>
                                
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={resendOtp}
                                        disabled={isLoading}
                                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium disabled:opacity-50"
                                    >
                                        Didn't receive code? Resend OTP
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}