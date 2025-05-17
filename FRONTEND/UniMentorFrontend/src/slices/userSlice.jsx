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

export const getUserById = createAsyncThunk('/users/getUserById',async(id,{rejectWithValue})=>{
    try{
        const response = await axios.get(`/users/${id}`,{headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        return rejectWithValue(err.response?.data) || {message:err.message}

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

export const fetchProfile = createAsyncThunk('users/fetchProfile',async(__,{rejectWithValue})=>{
    try{
        const response = await axios.get('/user/profile',{headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        console.log(err)
        return rejectWithValue(err.response.data)
    }
})

export const updateProfile = createAsyncThunk('users/updateProfile',async({formData,id},{rejectWithValue})=>{
    try{

        const response = await axios.put(`/user/${id}/profile`,formData,{headers:{Authorization:localStorage.getItem('token')}}) 
        return response.data
    }catch(err){
        console.log(err)
        return rejectWithValue(err.response.data)
    }
})
const userSlice = createSlice({
    name:'users',
    initialState:{
        users:[],
        user:[],
        serverError:null,
        loading:false,
        isLoggedIn:false,
        profile:null,
        success:false
    },
    reducers:{
        login:(state,action)=>{
            state.users=action.payload
            state.isLoggedIn=true
        },
        logout:(state)=>{
            state.users=null
            state.isLoggedIn=false
        },
        clearErrors:(state)=>{
            state.serverError=null
        },
        clearSuccess:(state)=>{
            state.success = false
        },
    },
    extraReducers:(builder)=>{
        builder.addCase(listUsers.fulfilled,(state,action)=>{
            state.users = action.payload
        })
        builder.addCase(getUserById.pending, (state) => {
            state.loading = true
          })
          builder.addCase(getUserById.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
            state.serverError = null
          })
          builder.addCase(getUserById.rejected, (state, action) => {
            state.loading = false
            state.serverError = action.payload
          })
        builder.addCase(fetchProfile.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(fetchProfile.fulfilled,(state,action)=>{
            state.loading = false
            state.profile = action.payload
            state.serverError = null
        })
        builder.addCase(fetchProfile.rejected,(state,action)=>{
            state.loading = false
            state.server = action.payload
        })
        builder.addCase(updateProfile.pending,(state,action)=>{
            state.loading = false
        })
        builder.addCase(updateProfile.fulfilled,(state,action)=>{
            state.loading = false
            state.profile = action.payload
            state.serverError = null
            state.success = true
        })
        builder.addCase(updateProfile.rejected,(state,action)=>{
            state.loading = false
            state.server = action.payload
        })
    }
})
export const {login,logout,clearErrors,clearSuccess} = userSlice.actions
export default userSlice.reducer