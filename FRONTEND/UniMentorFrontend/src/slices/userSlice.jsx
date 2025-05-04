import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from '../config/axios.jsx'

export const listUsers = createAsyncThunk('users/listUsers',async()=>{
    try{
        const response = await axios.get('/users',{headers:{Authorization: localStorage.getItem('token')}})
    console.log(response.data)
    return response.data
    }catch(err){
        console.log(err)
    }
})
export const createUser=createAsyncThunk('users/createUser',async(formData)=>{
    try{
        const response = await axios.post('/category',formData,{headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        console.log(err)
    }
})
export const activeUser = createAsyncThunk('user/activeUser',async(id)=>{
    try{
        const response = await axios.put(`activation/${id}`,{isActive:true},{
            headers:{Authorization:localStorage.getItem('token')}
        })
        console.log(response.data)
        return response.data
    }catch(err){
        console.log(err)
    }
})

const userSlice = createSlice({
    name:'users',
    initialState:{
        users:[],
        serverError:null
    },
    reducers:{
        login:(state,action)=>{
            state.user=action.payload
            state.isLoggedIn=true
        },
        logout:(state)=>{
            state.user=null
            state.isLoggedIn=false
        }
    }
})
export const {login,logout} = userSlice.actions
export default userSlice.reducer