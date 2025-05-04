import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../slices/userSlice'
import accountReducer from '../slices/accountSlice'

const store = configureStore({
    reducer:{
        users:userReducer,
        account:accountReducer
    }
})
export default store