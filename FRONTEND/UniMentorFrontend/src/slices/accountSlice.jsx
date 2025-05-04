import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from '../config/axios.jsx'

export const fetchUserAccount = createAsyncThunk('users/fetchUserAccount',async(undefined,{rejectWithValue})=>{
    try{
        const response = await axios.get('/account',{headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        console.log(err)
    }
})

export const deleteUser = createAsyncThunk('users/deleteUser',async(id)=>{
    try{
        const response = await axios.delete(`remove/${id}`,{headers:{Authorization:localStorage.getItem('token')}})
        return id
    }catch(err){
        console.log(err)
    }
})

const accountSlice=createSlice({
    name:'account',
    initialState:{
        data:{},
        isLoggedIn:false,
        serverError:null
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchUserAccount.fulfilled,(state,action)=>{
            state.data=action.payload
        })
        builder.addCase(fetchUserAccount.rejected,(state,action)=>{
            state.serverError=action.payload
        })
        builder.addCase(deleteUser.fulfilled,(state,action)=>{
            state.data={}
            localStorage.removeItem('token')
        })
        
    }
})
export default accountSlice.reducer