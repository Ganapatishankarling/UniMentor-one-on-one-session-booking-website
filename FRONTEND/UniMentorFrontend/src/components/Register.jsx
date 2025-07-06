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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Main register card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-xl mb-4">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Create Account
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Join our community and start your journey
                        </p>
                    </div>
                
                    {/* Server Error Alert */}
                    {serverErrors && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800 mb-1">
                                        Registration Error
                                    </h3>
                                    <p className="text-sm text-red-700">{serverErrors}</p>
                                </div>
                            </div>
                        </div>
                    )}
                
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                        clientErrors.name 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {clientErrors.name && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.name}</span>
                                </p>
                            )}
                        </div>
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                        clientErrors.email 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {clientErrors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.email}</span>
                                </p>
                            )}
                        </div>
                        
                        {/* Mobile Input */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="mobile"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                        clientErrors.mobile 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                            {clientErrors.mobile && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.mobile}</span>
                                </p>
                            )}
                        </div>
                        
                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                        clientErrors.password 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {clientErrors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.password}</span>
                                </p>
                            )}
                        </div>
                        
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center justify-center">
                                    <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                        role === 'mentor' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="mentor"
                                            checked={role === 'mentor'}
                                            onChange={() => setRole('mentor')}
                                            className="sr-only"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Mentor</span>
                                    </label>
                                </div>
                                <div className="flex items-center justify-center">
                                    <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                        role === 'student' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="student"
                                            checked={role === 'student'}
                                            onChange={() => setRole('student')}
                                            className="sr-only"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Student</span>
                                    </label>
                                </div>
                                <div className="flex items-center justify-center">
                                    <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                        role === 'admin' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === 'admin'}
                                            onChange={() => setRole('admin')}
                                            className="sr-only"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Admin</span>
                                    </label>
                                </div>
                            </div>
                            {clientErrors.role && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.role}</span>
                                </p>
                            )}
                            
                            {/* Admin Passcode */}
                            {role === "admin" && (
                                <div className="mt-4">
                                    <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Admin Passcode
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="passcode"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                                clientErrors.code 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                                            }`}
                                            placeholder="Enter admin passcode"
                                        />
                                    </div>
                                    {clientErrors.code && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{clientErrors.code}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                isLoading 
                                    ? 'opacity-70 cursor-not-allowed' 
                                    : 'hover:bg-emerald-700 active:bg-emerald-800'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Sending OTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                {/* Security note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Your information is protected by enterprise-grade security
                    </p>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Verify Your Email</h3>
                            <button
                                onClick={closeOtpModal}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {successMessage ? (
                            <div className="text-center py-4">
                                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-lg font-medium text-green-600 mb-2">{successMessage}</h4>
                                <p className="text-gray-500 text-sm">Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <p className="text-gray-600 text-sm">
                                        We've sent a 6-digit verification code to
                                    </p>
                                    <p className="font-medium text-gray-900">{registrationData?.email}</p>
                                </div>
                                
                                {otpError && (
                                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <p className="text-sm text-red-700">{otpError}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleOtpVerification} className="space-y-4">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                            Verification Code
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Shield className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-lg tracking-widest"
                                                placeholder="000000"
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                            isLoading 
                                                ? 'opacity-70 cursor-not-allowed' 
                                                : 'hover:bg-emerald-700'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Verifying...</span>
                                            </div>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </button>
                                </form>
                                
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={resendOtp}
                                        disabled={isLoading}
                                        className="text-emerald-600 hover:text-emerald-500 text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Didn't receive the code? Resend OTP
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