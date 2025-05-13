import React,{useState,useRef, useEffect} from 'react'
import {Camera,X} from 'lucide-react'

export default function ProfileImageUplaod({profileImage,name,onImageChange}){
    console.log("prodil",profileImage);
    
    const [previewImage,setPreviewImage] = useState(profileImage)
    console.log("imgs",previewImage);
    useEffect(() => {
        console.log("profileImage changed to:", profileImage);
        if (profileImage) {
          setPreviewImage(profileImage);
        }
      }, [profileImage]);
    const [showUploadModal,setShowUploadModal] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) =>{
        const file = e.target.files[0]
        if(file){
            const reader = new FileReader()

            reader.onload = ()=>{
                setPreviewImage(reader.result)
                onImageChange(file)
            }
            reader.readAsDataURL(file)
            setShowUploadModal(false)
        }
    }
    const triggerFileInput = ()=>{
        fileInputRef.current.click()
    }
    const cancleUploaD = ()=>{
        fileInputRef.current.click()
    }
    const cancelUpload = ()=>{
        setShowUploadModal(false)
    }
    const defaultImage = name?.charAt(0).toUpperCase()
    const imageUrl = previewImage?.startsWith('data:image') || previewImage?.startsWith('http')
    ? previewImage
    : `http://localhost:3047${previewImage}`;

    console.log("img",imageUrl);
    
    return(
        <div>
            <div>
                {imageUrl ?(
                    <img 
                    src={imageUrl}
                    alt='profile'
                    />
                ):(
                    <span>{defaultImage}</span>
                )}
                <button type="button" onClick={()=>{
                    setShowUploadModal(true)
                }}aria-label="Edit profile Picture"><Camera size={16}/></button>
            </div>
            <input type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            />
            {showUploadModal && (
                <div>
                    <div>
                        <div>
                            <h3>Update Profile Picture</h3>
                            <button onClick={cancelUpload}><X size={20}/></button>
                        </div>
                        <div>
                            <button onClick={triggerFileInput}>Choose from Device</button>
                        </div>
                        <button onClick={cancelUpload}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}