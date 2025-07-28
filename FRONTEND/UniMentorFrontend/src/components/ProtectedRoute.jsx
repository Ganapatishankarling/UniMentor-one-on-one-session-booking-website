import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { listUsers } from '../slices/userSlice';
import { fetchUserAccount } from '../slices/accountSlice';

export default function ProtectedRoute({ children, allowedRoles = [] }){
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { data:profile } = useSelector((state) => state.account);
 useEffect(() => {
    dispatch(listUsers ());
     dispatch(fetchUserAccount());
  }, [dispatch]);
  const token = localStorage.getItem('token');

  useEffect(()=>{
    if(!token){
      navigate('/login')
    }
  },[token])

  // If user profile is not loaded yet, show loading
  if (!profile || !profile.role) {
    return <div>Loading...</div>;
  }

  // If allowedRoles is empty, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in allowed roles (case-sensitive to match backend)
  console.log("al",allowedRoles);
  
  const userRole = profile?.role
  console.log("user",userRole);
  
  const hasPermission = allowedRoles.includes(userRole);
console.log("has",hasPermission);

  if (profile?.role && !hasPermission) {
     console.log("Redirecting to /unauthorized...");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};