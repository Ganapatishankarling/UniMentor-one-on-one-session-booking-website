import React from 'react'
// import './App.css'
import {Routes,Route} from 'react-router-dom'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Account from './components/Account.jsx'
import Profile from './components/Profile.jsx'
import EditProfile from './components/EditProfile.jsx'
import Category from './components/Category.jsx'
import CategoryForm from './components/CategoryForm.jsx'
import Homepage from './components/Homepage.jsx'
import SessionForm from './components/SessionForm.jsx'
import ListSession from './components/ListSession.jsx'
import MentorProfile from './components/MentorProfile.jsx'
import AdminApprovel from './components/AdminApprovel.jsx'
import { ToastContainer } from 'react-toastify'
import BookSession from './components/SessionBooking.jsx'
import ForgotPassword from './components/Forgot-Password.jsx'
import Unimentor from './components/Unimentor.jsx'
import AdminListing from './components/AdminListing.jsx'
import ReviewForm from './components/ReviewForm.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import UnauthorizedAccess from './components/UnauthorizedAccess.jsx'
import ResetPassword from './components/Reset-Password.jsx'
import MentorAvailability from './components/MentorAvailability.jsx'
import Analytics from './components/Analytics.jsx'

export default function App(){
  return(
    <div className=''>
<ToastContainer/>
<Unimentor />
      <Routes>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/unauthorized' element={<UnauthorizedAccess/>}/>
    <Route path='/reset-password' element={<ResetPassword />} />
        {/* Protected routes - All authenticated users */}
        <Route path='/account' element={
          <ProtectedRoute>
            <Account/>
          </ProtectedRoute>
        }/>
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        }/>
        <Route path='/edit-profile' element={
          <ProtectedRoute>
            <EditProfile/>
          </ProtectedRoute>
        }/>
        <Route path='/' element={
          <ProtectedRoute>
            <Homepage/>
          </ProtectedRoute>
        }/>
        <Route path="/mentor/:mentorId" element={
          <ProtectedRoute>
            <MentorProfile />
          </ProtectedRoute>
        } />
        
        {/* Student-only routes */}
        <Route path='/book-session/:mentorId' element={
          <ProtectedRoute allowedRoles={['student']}>
            <BookSession />
          </ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute allowedRoles={['student']}>
            <ReviewForm />
          </ProtectedRoute>
        } />

        {/* Mentor-only routes */}
        <Route path='/sessions' element={
          <ProtectedRoute allowedRoles={['mentor','student']}>
            <ListSession />
          </ProtectedRoute>
        }/>
        <Route path='/add-session' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <SessionForm/>
          </ProtectedRoute>
        }/>
        <Route path="/mentor-availability" element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <MentorAvailability />
          </ProtectedRoute>
        }/>
              <Route path="/Analytics" element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Analytics />
          </ProtectedRoute>
        } />
        


        {/* Admin-only routes */}
        <Route path='/category' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Category/>
          </ProtectedRoute>
        }/>
        <Route path='/add-category/:id' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CategoryForm/>
          </ProtectedRoute>
        }/>
        <Route path='/add-category' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CategoryForm/>
          </ProtectedRoute>
        }/>
        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApprovel />
          </ProtectedRoute>
        } />
        <Route path="/admin-listing" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminListing />
          </ProtectedRoute>
        } />
        <Route path="/mentor-availability" element={<MentorAvailability />} />
        <Route path="/Analytics" element={<Analytics />} />
        
      </Routes>
    </div>
  )
}