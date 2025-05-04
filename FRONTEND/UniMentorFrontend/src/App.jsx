import React from 'react'
import './App.css'
import {Routes,Route,Link,useNavigate} from 'react-router-dom'
import {useEffect} from 'react'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Account from './components/Account.jsx'
import Profile from './components/Profile.jsx'
import EditProfile from './components/EditProfile.jsx'
import {fetchProfile} from './slices/userSlice.jsx'
import {useSelector,useDispatch} from 'react-redux'
import { fetchUserAccount } from './slices/accountSlice.jsx'
import {login,logout} from './slices/userSlice.jsx'
import Category from './components/Category.jsx'
import CategoryForm from './components/CategoryForm.jsx'
import Test from './components/test.jsx'

export default function App(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {isLoggedIn} = useSelector((state)=>{
    return state.account
  })
  useEffect(()=>{
    if(localStorage.getItem('token')){
      dispatch(fetchUserAccount())
    }
  },[])
  return(
    <div className='App'>
      <h1>Welcome to UniMentor</h1>
       <ul>
        {isLoggedIn === false ?( 
          <>
          <li><Link to='/account'>Account</Link></li>
          <li><Link to='/category'>Category</Link></li>
          <li><button onClick={()=>{dispatch(logout());localStorage.removeItem('token');navigate('/login')}}>Logout</button></li>
        </>
        ):(
          <>
          <li><Link to='/register'>Register</Link></li>
          <li><Link to='/login'>Login</Link></li>
          </>
        )}
      </ul>
      <Routes>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/edit-profile' element={<EditProfile/>}/>
        <Route path='/category' element={<Category/>}/>
        <Route path='/add-category/:id' element={<CategoryForm/>}/>
        <Route path='/add-category' element={<CategoryForm/>}/>
      </Routes>
    </div>
  )
}