import React from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {useEffect} from 'react'
import {fetchUserAccount} from '../slices/accountSlice.jsx'
import {useNavigate} from 'react-router-dom'
import {deleteUser} from '../slices/accountSlice.jsx'

export default function Account(){
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        dispatch(fetchUserAccount())
    },[dispatch])
    const {data} = useSelector((state)=>{
        return state.account
    })
    console.log(data)

    const handleDeleteAccount = async()=>{
        const request = window.confirm('are you sure you want to delete this account')
        if(request){
            const result = await dispatch(deleteUser(data._id))
            if(deleteUser.fulfilled.match(result)){
                navigate('/login')
            }
        }
    }
    return(
        <div>
            <h2>User Account</h2>
            <div>
                <p>Name-{data.name}</p>
                <p>Email-{data.email}</p>
                <p>Mobile-{data.mobile}</p>
                <p>role-{data.role}</p>
            </div>
            <div>
                <h2>
                    <div>
                        <p><span>{data.name}</span></p>
                        <p><span>{data.email}</span></p>
                        <p><span>{data.mobile}</span></p>
                        <p><span>{data.role}</span></p>
                        <div>
                            <button>Update Profile</button>
                            <button onClick={()=>{
                                handleDeleteAccount()
                            }}>Delete Account</button>
                        </div>
                    </div>
                </h2>
            </div>
        </div>
    )
}