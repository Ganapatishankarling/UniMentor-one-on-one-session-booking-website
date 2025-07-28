import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../slices/userSlice'
import accountReducer from '../slices/accountSlice'
import categoryReducer from '../slices/categorySlice'
import profileReducer from '../slices/userSlice'
import sessionReducer from '../slices/sessionSlice'
import reviewReducer from '../slices/reviewSlice'
const store = configureStore({
    reducer:{
        users:userReducer,
        account:accountReducer,
        categories:categoryReducer,
        profile:profileReducer,
        sessions:sessionReducer,
        reviews:reviewReducer,
    }
})
export default store