import React, { useState } from 'react';
import { isEmail } from 'validator';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios.jsx';
import { useDispatch } from 'react-redux';
import { login } from '../slices/userSlice.jsx';
import { AlertCircle, Mail, Lock, LogIn, Eye, EyeOff, User, Shield, Sparkles } from 'lucide-react';

export default function Login() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [clientErrors, setClientErrors] = useState({});
    const [serverErrors, setServerErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const errors = {};
        if (email.trim().length === 0) {
            errors.email = 'Email is required';
        } else if (!isEmail(email)) {
            errors.email = 'Please provide a valid email';
        }
        if (password.trim().length === 0) {
            errors.password = 'Password is required';
        } else if (password.trim().length < 8 || password.trim().length > 128) {
            errors.password = 'Password should be between 8 to 128 characters';
        }
        
        if (Object.entries(errors).length > 0) {
            setClientErrors(errors);
            setIsLoading(false);
        } else {
            const formData = {
                email: email,
                password: password
            };
            
            try {
                const response = await axios.post("/login", formData);
                console.log(response.data);
                localStorage.setItem('token', response.data.token);
                const userResponse = await axios.get("/account", {
                    headers: { Authorization: localStorage.getItem('token') }
                });
                console.log(userResponse.data);
                dispatch(login(userResponse.data));
                navigate('/profile');
            } catch (err) {
                setServerErrors(err.response.data.errors);
                setClientErrors({});
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Main login card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-xl mb-4">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Please sign in to your account
                        </p>
                    </div>

                    {/* Server Error Alert */}
                    {serverErrors && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800 mb-1">
                                        Authentication Error
                                    </h3>
                                    <p className="text-sm text-red-700">{serverErrors}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    placeholder="Enter your email"
                                />
                            </div>
                            {clientErrors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{clientErrors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
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
                                    placeholder="Enter your password"
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

                        {/* Sign In Button */}
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
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Don't have an account?
                            </p>
                            <Link 
                                to="/register" 
                                className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>Create an account</span>
                                <Sparkles className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Security note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Protected by enterprise-grade security
                    </p>
                </div>
            </div>
        </div>
    );
}