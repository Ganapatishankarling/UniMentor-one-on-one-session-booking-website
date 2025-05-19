import React from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {useEffect} from 'react'
import {fetchUserAccount} from '../slices/accountSlice.jsx'
import {useNavigate} from 'react-router-dom'
import {deleteUser} from '../slices/accountSlice.jsx'
import { User, Mail, Phone, UserCheck, Edit, Trash2 } from 'lucide-react';

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
          return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8 rounded-xl bg-white p-8 shadow-xl">
                  <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">User Account</h2>
                  
                  <div className="mb-8 overflow-hidden rounded-lg bg-indigo-50 shadow">
                    <div className="px-6 py-8">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="text-lg font-medium text-gray-900">{data?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-lg font-medium text-gray-900">{data?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Mobile</p>
                            <p className="text-lg font-medium text-gray-900">{data?.mobile}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <UserCheck className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Role</p>
                            <p className="text-lg font-medium capitalize text-indigo-600">{data?.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-gray-900">Account Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{data?.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{data?.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{data?.mobile}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{data?.role}</span>
                      </div>
                      
                      <div className="mt-6 flex flex-col space-y-3 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <button className="flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <Edit className="mr-2 h-4 w-4" />
                          Update Profile
                        </button>
                        
                        <button 
                          onClick={handleDeleteAccount}
                          className="flex items-center justify-center rounded-md border border-red-200 bg-white px-6 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
}