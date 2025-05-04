import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import axios from '../config/axios.jsx'

export const listCategories = createAsyncThunk('categories/listCategories',async()=>{
    try{
        const response = await axios.get('/category')
        return response.data
    }catch(err){
        console.log(err)
    }
})

export const createCategory = createAsyncThunk('categories/createCategory',async(formData)=>{
    try{
        const response = await axios.post('/category',formData,{headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        console.log(err)
    }
})

export const deleteCategory = createAsyncThunk('categories/deleteCategory',async(id)=>{
    try{
        const response = await axios.delete(`/category/${id}`,{headers:{Authorization:localStorage.getItem('token')}})
        return id
    }catch(err){
        console.log(err)
    }
})

export const updateCategory = createAsyncThunk('categories/updateCategory',async({id,formData},{})=>{
    try{
        const response = await axios.put(`/category/${id}`,formData,{headers:{Authorization:localStorage.getItem('token')}});
        console.log(response.data)
        return response.data
    }catch(err){
        console.log(err)
    }
})

const categorySlice = createSlice({
    name:"categories",
    initialState:{
        data:[],
        loading:false,
        serverError:null,
        editId:null
    },
    reducers:{
        assignEditId:(state,action)=>{
            state.editId=action.payload
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(listCategories.fulfilled,(state,action)=>{
            state.data = action.payload
        })
        builder.addCase(createCategory.fulfilled,(state,action)=>{
            state.data.push(action.payload)
        })
        builder.addCase(updateCategory.fulfilled,(state,action)=>{
            const index = state.data.findIndex((ele)=>{
                return ele._id ===state.editId
            })
            state.data[index]=action.payload
            state.editId=''
        })
        builder.addCase(deleteCategory.fulfilled,(state,action)=>{
            state.data = state.data.filter((ele)=>{
                return ele._id !== action.payload
            })
        
        })
    }
})
export const {assignEditId}=categorySlice.actions;
export default categorySlice.reducer