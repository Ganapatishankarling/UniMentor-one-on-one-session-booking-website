import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../slices/userSlice'
import accountReducer from '../slices/accountSlice'
import categoryReducer from '../slices/categorySlice'
import profileReducer from '../slices/userSlice'

const store = configureStore({
    reducer:{
        users:userReducer,
        account:accountReducer,
        categories:categoryReducer,
        profile:profileReducer
    }
})
export default store