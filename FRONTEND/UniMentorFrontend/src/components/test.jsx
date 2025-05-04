import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateProfile, clearSuccess } from "../slices/userSlice.jsx";
import { useNavigate } from "react-router-dom";
import { fetchUserAccount } from "../slices/accountSlice.jsx";

export default function Test() {
    console.log("test page");
    
  const dispatch = useDispatch();
  const navigate = useNavigate();
//   let profile = ""
  useEffect(() => {
  
    
    dispatch(fetchUserAccount());
  }, [dispatch]);
  const { loading, serverError, success ,data:profile} = useSelector((state) => state.account);
//   const { user } = useSelector((state) => state.users);
  console.log("usrt",profile);
//   let user = ""
  
  
  // Common fields for all users
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  // Student specific fields
  const [studentData, setStudentData] = useState({
    education: "",
    university: "",
  });

  // Mentor specific fields
  const [mentorData, setMentorData] = useState({
    education: "",
    expertiseArea: "",
    bio: "",
    university: "",
  });

 

  useEffect(() => {
    if (profile !==null) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile?.mobile || "",
        profileImage: profile.profileImage || "",
      });

      if (profile.role === "student") {
        setStudentData({
          education: profile.education || "",
          university: profile.university || "",
        });
      } else if (profile.role === "mentor") {
        setMentorData({
          education: profile.education || "",
          expertiseArea: profile.expertiseArea || "",
          bio: profile.bio || "",
          university: profile.university || "",
        });
      }
    }
  }, [profile, ]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let updatedData = { ...formData };
    
    if (profile?.role === "student") {
      updatedData = { ...updatedData, ...studentData };
    } else if (profile?.role === "mentor") {
      updatedData = { ...updatedData, ...mentorData };
    }
    
    await dispatch(updateProfile(updatedData));
  };

  const renderRoleSpecificFields = () => {
    if (profile?.role === "student") {
      return (
        <div>
          <h3 className="text-lg font-semibold mb-3">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={studentData.studentId}
                onChange={handleStudentDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Course</label>
              <input
                type="text"
                name="course"
                value={studentData.course}
                onChange={handleStudentDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={studentData.semester}
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
              <label className="block text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={mentorData.designation}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Expertise</label>
              <input
                type="text"
                name="expertise"
                value={mentorData.expertise}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
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
              <label className="block text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={mentorData.department}
                onChange={handleMentorDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
          Cancel
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
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400">
                    {formData.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Profile Image URL</label>
              <input
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
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
              value={formData.bio}
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