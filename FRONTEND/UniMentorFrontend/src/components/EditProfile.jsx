
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, clearSuccess } from "../slices/userSlice.jsx";
import { useNavigate } from "react-router-dom";
import { listCategories } from '../slices/categorySlice.jsx'
import { fetchUserAccount } from "../slices/accountSlice.jsx";
import ProfileImageUpload from "./ProfileImageUpload.jsx";
import { User, Mail, Phone, BookOpen, GraduationCap, Calendar, Award, Building2, Briefcase, ArrowLeft, Save, Sparkles, X } from "lucide-react";

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserAccount());
    dispatch(listCategories())
  }, [dispatch]);
  
  const { loading, serverError, success, data: profile } = useSelector((state) => state.account);
  const { categories } = useSelector((state) => state.categories)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    bio: "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null)
  const [isAnimated, setIsAnimated] = useState(false);

  const [studentData, setStudentData] = useState({
    education: "",
    university: "",
    graduationYear: ""
  });
  
  const [mentorData, setMentorData] = useState({
    expertiseAreas: [],
    experience: "",
    university: "",
    categoryId: "",
  });

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile?.mobile || "",
        profileImage: profile.profileImage || "",
        bio: profile?.bio || "",
      });

      if (profile?.role === "student") {
        setStudentData({
          education: profile.education || "",
          university: profile.university || "",
          graduationYear: profile.graduationYear || "",
        });
      } else if (profile.role === "mentor") {
        // Handle both string and array formats for backward compatibility
        const existingExpertise = profile.expertiseAreas;
        let expertiseArray = [];
        
        if (typeof existingExpertise === 'string') {
          expertiseArray = existingExpertise ? [existingExpertise] : [];
        } else if (Array.isArray(existingExpertise)) {
          expertiseArray = existingExpertise;
        }

        setMentorData({
          experience: profile.experience || "",
          university: profile.university || "",
          expertiseAreas: expertiseArray,
        });
      }
    }
  }, [profile, profile?.role]);

  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      navigate("/profile");
    }
  }, [success, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStudentDataChange = (e) => {
    const { name, value } = e.target;
    setStudentData({
      ...studentData,
      [name]: value,
    });
  };

  const handleMentorDataChange = (e) => {
    const { name, value } = e.target;
    setMentorData({
      ...mentorData,
      [name]: value,
    });
  };

  const handleExpertiseSelect = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory && !mentorData.expertiseAreas.includes(selectedCategory)) {
      setMentorData({
        ...mentorData,
        expertiseAreas: [...mentorData.expertiseAreas, selectedCategory]
      });
    }
    // Reset the select to default
    e.target.value = "";
  };

  const handleExpertiseRemove = (expertiseToRemove) => {
    setMentorData({
      ...mentorData,
      expertiseAreas: mentorData.expertiseAreas.filter(expertise => expertise !== expertiseToRemove)
    });
  };

  const handleImageChange = (file) => {
    console.log("file",file);
    
    setProfileImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let updatedData = { ...formData };
    
    if (profile?.role === "student") {
      updatedData = { ...updatedData, ...studentData };
    } else if (profile?.role === "mentor") {
      // Convert expertiseAreas array to string for backend compatibility if needed
      const mentorDataToSend = {
        ...mentorData,
        expertiseAreas: mentorData.expertiseAreas.join(', ') // or send as array based on your backend
      };
      updatedData = { ...updatedData, ...mentorDataToSend };
    }

    const formDataToSend = new FormData()

    Object.keys(updatedData).forEach(key => {
      formDataToSend.append(key, updatedData[key])
    })

    if (profileImageFile) {
      formDataToSend.append('profileImage', profileImageFile)
    }
    
    const id = profile?._id
    await dispatch(updateProfile({ formData: formDataToSend, id }));
  };

  const renderRoleSpecificFields = () => {
    if (profile?.role === "student") {
      return (
        <div className={`transition-all duration-700 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-lg border border-blue-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Student Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={studentData.education}
                    onChange={handleStudentDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>
                
                <div className="group">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    University
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={studentData.university}
                    onChange={handleStudentDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
                    placeholder="e.g., Harvard University"
                  />
                </div>
                
                <div className="group md:col-span-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={studentData.graduationYear}
                    onChange={handleStudentDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (profile?.role === "mentor") {
      return (
        <div className={`transition-all duration-700 delay-200 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 shadow-lg border border-emerald-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30 -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Mentor Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    University
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={mentorData.university}
                    onChange={handleMentorDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                    placeholder="e.g., MIT"
                  />
                </div>
                
                <div className="group">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={mentorData.experience}
                    onChange={handleMentorDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                    placeholder="e.g., 5"
                  />
                </div>
                
                <div className="group md:col-span-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Expertise Areas
                  </label>
                  <select
                    onChange={handleExpertiseSelect}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:border-emerald-300"
                  >
                    <option value="">Select a Category to Add</option>
                    {categories && categories.map((category) => (
                      <option 
                        key={category._id} 
                        value={category.name}
                        disabled={mentorData.expertiseAreas.includes(category.name)}
                      >
                        {category.name} {mentorData.expertiseAreas.includes(category.name) ? '(Selected)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Selected Expertise Areas Display */}
                  {mentorData.expertiseAreas.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3 font-medium">Selected Expertise Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {mentorData.expertiseAreas.map((expertise, index) => (
                          <div
                            key={index}
                            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300"
                          >
                            <span className="text-emerald-800 font-medium text-sm">
                              {expertise}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleExpertiseRemove(expertise)}
                              className="flex items-center justify-center w-5 h-5 bg-red-100 hover:bg-red-200 border border-red-300 rounded-full transition-all duration-200 group-hover:scale-110"
                              title={`Remove ${expertise}`}
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xl font-semibold text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className={`flex justify-between items-center mb-8 transition-all duration-500 ${isAnimated ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-600 mt-2">Update your professional information</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="group flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
        </div>

        {/* Error Message */}
        {serverError && (
          <div className={`bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-lg transition-all duration-500 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {serverError.message}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Profile Section */}
          <div className={`bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-gray-200 transition-all duration-500 delay-100 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Profile Image Section */}
            <div className="mb-8 text-center">
              <ProfileImageUpload
                profileImage={formData?.profileImage}
                name={formData.name}
                onImageChange={handleImageChange}
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-blue-300"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Email cannot be changed
                </p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData?.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-blue-300"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  Role
                </label>
                <input
                  type="text"
                  value={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6 group">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <User className="w-4 h-4 text-blue-500" />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData?.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none group-hover:border-blue-300"
                rows="4"
                placeholder="Tell us about yourself, your interests, and professional background..."
              ></textarea>
            </div>
          </div>

          {/* Role Specific Fields */}
          {renderRoleSpecificFields()}

          {/* Submit Button */}
          <div className={`flex justify-end transition-all duration-700 delay-300 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button
              type="submit"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}