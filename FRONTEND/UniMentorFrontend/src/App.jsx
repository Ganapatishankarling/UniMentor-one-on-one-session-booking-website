import React from 'react'
import './App.css'
import {Routes,Route,Link,useNavigate} from 'react-router-dom'
import {useEffect} from 'react'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Account from './components/Account.jsx'
import {useSelector,useDispatch} from 'react-redux'
import { fetchUserAccount } from './slices/accountSlice.jsx'
import {login,logout} from './slices/userSlice.jsx'

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
        {isLoggedIn ?( 
          <>
          <li><Link to='/account'>Account</Link></li>
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
      </Routes>
    </div>
  )
}