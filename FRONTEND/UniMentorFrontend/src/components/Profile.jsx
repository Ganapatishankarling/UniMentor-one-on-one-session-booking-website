import React,{useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {fetchProfile} from '../slices/userSlice.jsx'
import {Link} from 'react-router-dom'
import { fetchUserAccount } from '../slices/accountSlice.jsx'

export default function Profile(){
    const dispatch = useDispatch()
    const {loading,serverError,data:account} = useSelector((state)=>state.account
    )
//  const account= useSelector((state)=>state.account)
    console.log("tedt",account);
    
   

    useEffect(()=>{
        dispatch(fetchUserAccount())
    },[dispatch])

    if(loading){
        return (
            <div>
                <div>Loading...</div>
            </div>
        )
    }

    if(serverError){
        return(
            <div>
                <div>
                    Error loading Profile:{serverError.message}
                </div>
            </div>
        )
    }

    if(!account){
        return(
            <div>
                <div>No account data available</div>
            </div>
        )
    }

    const  rolesSpecificDetails = ()=>{
        if(user.role === 'student'){
            return(
                <div>
                    <h3>
                        Student Information
                    </h3>
                    <div>
                        <div>
                            <p>University</p>
                            <p>{account.university || 'Not set'}</p>
                        </div>
                        <div>
                            <p>Education</p>
                            <p>{account.education || 'Not set'}</p>
                        </div>
                    </div>
                </div>
            )
        }else if(user.role === 'mentor'){
            return(
                <div>
                    <h3>Mentor Information</h3>
                    <div>
                        <div>
                            <p>University</p>
                            <p>{account.university || 'Not Set'}</p>
                        </div>
                        <div>
                            <p>Education</p>
                            <p>{account.education || 'Not set'}</p>
                        </div>
                        <div>
                            <p>Expertise Area</p>
                            <p>{account.expertiseArea || 'Not set'}</p>
                        </div>
                        <div>
                            <p>Bio</p>
                            <p>{account.bio || 'Not set'}</p>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }
    return (
        <div>
          <div>
            <h1>Profile</h1>
            <Link
              to="/edit-profile"
            >
              Edit Profile
            </Link>
          </div>
    
          <div>
            <div>
              <div>
                <div>
                  {account.profileImage ? (
                    <img
                      src={account.profileImage}
                      alt="Profile"
                    />
                  ) : (
                    <span>
                      {account.name?.charAt(1).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <p>Name</p>
                <p>{account.name}</p>
                <div>
                  <div>
                    <p>Email</p>
                    <p>{account.email}</p>
                  </div>
                  <div>
                    <p>Phone</p>
                    <p>{account.mobile || "Not set"}</p>
                  </div>
                  <div>
                    <p>Role</p>
                    <p >{account.role}</p>
                  </div>
                </div>
              </div>
            </div>
    
            <div >
              <h3>About</h3>
              <p>
                {account?.bio || "No bio information provided."}
              </p>
            </div>
    
            {/* {roleSpecificDetails()} */}
          </div>
        </div>
      );
}