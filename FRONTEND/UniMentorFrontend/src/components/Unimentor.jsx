import React, { useState, useEffect } from 'react';
import { Home, BookOpen, NotepadText,ChartNoAxesCombined,Clock} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAccount } from '../slices/accountSlice';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
    const dispatch = useDispatch();
  const path = location.pathname;
  const { data } = useSelector((state) => state.account);
   useEffect(() => {
     
      dispatch(fetchUserAccount());
    }, [dispatch]);

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const navigateToProfile = () => {
    // Navigate to profile page
    window.location.href = '/profile';
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // setIsLoggedIn(false);
    setUserData(null);
    setProfileDropdownOpen(false);
    // Redirect to login
    window.location.href = '/login';
  };

  // Component for navigation links to avoid repetition
  const NavLink = ({ to, children, icon }) => {
    const isActive = path === to;
    
    return (
      <a
        href={to}
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
          isActive 
            ? 'border-indigo-500 text-gray-900' 
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </a>
    );
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a 
                href="/"
                className="text-2xl font-bold text-indigo-600"
              >
                Unimentor
              </a>
            </div>

          {data?   <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {data.role === 'admin' && (
                <>
                <NavLink to="admin" icon={<Home className="h-4 w-4" />}>AdminApproval</NavLink>
                <NavLink to="admin-listing" icon={<NotepadText className="h-4 w-4" />}>AdminListing</NavLink>
                </>
              )}
              
              
              {data.role === 'mentor' && (
                <>
                <NavLink to="/add-session" icon={<BookOpen className="h-4 w-4" />}>CreateSession</NavLink>
                <NavLink to="/sessions" icon={<BookOpen className="h-4 w-4" />}>SessionHistory</NavLink>
                <NavLink to="/mentor-availability" icon={<Clock className="h-4 w-4"/>}>Availability</NavLink>
                <NavLink to="/Analytics" icon={<ChartNoAxesCombined className="h-4 w-4"/>}>Analytics</NavLink>
                </>
                
              )}
              {data.role === 'student' && (
                <>
                <NavLink to="/sessions" icon={<BookOpen className="h-4 w-4" />}>SessionHistory</NavLink>
                <NavLink to="/" icon={<Home className="h-4 w-4" />}>Home</NavLink>
                </>
              )}
              
            </div> : ""}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {data ? (
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {data?.name || "User"}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                    {data?.profileImage ? (
                      <img 
                        src={`http://localhost:3047${data.profileImage}`}
                        alt={data?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-indigo-500">
                        {data?.name ? data.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                </button>
               
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <button
                      onClick={navigateToProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  Sign up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}