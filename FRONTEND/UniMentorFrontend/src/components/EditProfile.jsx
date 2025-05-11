import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, clearSuccess } from "../slices/userSlice.jsx";
import { useNavigate } from "react-router-dom";
import { listCategories } from '../slices/categorySlice.jsx'
import { fetchUserAccount } from "../slices/accountSlice.jsx";
import ProfileImageUplaod from "./ProfileImageUpload.jsx";

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserAccount());
    dispatch(listCategories())
  }, [dispatch]);
  const { loading, serverError, success ,data:profile} = useSelector((state) => state.account);
  const { categories } = useSelector((state)=>state.categories)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    bio:"",
  });

  const [profileImageFile,setProfileImageFile] = useState(null)

  const [studentData, setStudentData] = useState({
    education: "",
    university: "",
    graduationYear:""
  });
  
  const [mentorData, setMentorData] = useState({
    
    expertiseAreas: "",
    experience: "",
    university: "",
    categoryId: "",
  });

 

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile?.mobile || "",
        profileImage: profile.profileImage || "",
        bio:profile?.bio || "",
      });

      if (profile?.role === "student") {
        setStudentData({
          education: profile.education || "",
          university: profile.university || "",
          graduationYear:profile.graduationYear || "",
        });
      } else if (profile.role === "mentor") {
        setMentorData({
          experience: profile.experience || "",
          university: profile.university || "",
          expertiseAreas:profile.expertiseAreas || "",
          // categoryId: profile.categoryId || "",
        });
      }
    }
  }, [profile,profile?.role ]);

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

  const handleImageChange = (file) => {
    setProfileImageFile(file);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let updatedData = { ...formData };
    
    if (profile?.role == "student") {
      updatedData = { ...updatedData, ...studentData };
      
    } else if (profile?.role === "mentor") {
      updatedData = { ...updatedData, ...mentorData };
    }

    const formDataToSend = new FormData()

    Object.keys(updatedData).forEach(key => {
      formDataToSend.append(key, updatedData[key])
    })

    if(profileImageFile){
      formDataToSend.append('profileImage',profileImageFile)
    }
    
    const id = profile?._id
    await dispatch(updateProfile({formData:updatedData,id}));
  };
profile?.role == "student"
  const renderRoleSpecificFields = () => {
    if (profile?.role === "student") {
      return (
        <div>
          <h3 className="text-lg font-semibold mb-3">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-gray-700 mb-1">Education</label>
              <input
                type="text"
                name="education"
                value={studentData.education}
                onChange={handleStudentDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">University</label>
              <input
                type="text"
                name="university"
                value={studentData.university}
                onChange={handleStudentDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Graduation Year</label>
              <input
                type="text"
                name="graduationYear"
                value={studentData.graduationYear}
                onChange={handleStudentDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      );
    } else if (profile?.role === "mentor") {
      return (
        <div className="bg-green-50 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-3">Mentor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">University</label>
              <input
                type="text"
                name="university"
                value={mentorData.university}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* <div>
              <label className="block text-gray-700 mb-1">ExpertiseArea</label>
              <input
                type="text"
                name="expertiseAreas"
                value={mentorData?.expertiseAreas}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
            
            <div>
              <label className="block text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={mentorData.experience}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">ExpertiseAreas</label>
              <select
              name="expertiseAreas"
              value={mentorData.expertiseAreas}
              onChange={handleMentorDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Category</option>
                {categories && categories.map((category)=>(
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                </select>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <button
          onClick={() => navigate("/profile")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Back
        </button>
      </div>

      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {serverError.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <div>
            <ProfileImageUplaod
            profileImage={formData?.profileImage}
            name={formData.name}
            onImageChange={handleImageChange}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData?.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Role</label>
              <input
                type="text"
                  value={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                disabled
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData?.bio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          {renderRoleSpecificFields()}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}