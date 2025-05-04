import React from "react"
import {useEffect} from "react"
import {useSelector,useDispatch} from "react-redux"
import {listCategories,deleteCategory} from "../slices/categorySlice.jsx"
import {useNavigate,Link} from "react-router-dom"
import {assignEditId} from "../slices/categorySlice.jsx"
export default function Category(){
    const dispatch=useDispatch()
    const navigate=useNavigate()
   
    const {serverError,editId,categories} = useSelector((state)=>state.categories);
    
    
    useEffect(()=>{
         dispatch(listCategories())
    },[dispatch])

    const handleDelete = (id)=>{
        dispatch(deleteCategory(id))
    }
   
    
    return(
        <div>
            <div>
                {/* <tabel>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories?.map((ele)=>{
                            return (
                                <tr key={ele.id}>
                                    <td>{ele.name}</td>
                                    <td><button className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={()=>{
                                        navigate(`/add-category/${ele._id}`)
                                    }}>Edit</button><button onClick={()=>{handleDelete(ele._id)}} className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Delete</button></td>
                                </tr>
                            )
                        })}
                      
                    </tbody>
                </tabel> */}

{/*  */}


<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                   ID
                </th>
                <th scope="col" class="px-6 py-3">
                   Category name
                </th>
                <th scope="col" class="px-6 py-3">
                    Edit
                </th>
                <th scope="col" class="px-6 py-3">
                    Delete
                </th>
            </tr>
        </thead>
        <tbody className="p-5 m-10 gap-5">
        {categories?.map((ele)=>{
                            return (
                                <tr key={ele._id} className="p-5 m-10 gap-5">
                                       <td class="px-6 py-4">{ele?._id}</td>
                                       <td class="px-6 py-4">{ele.name}</td>
                                       <td class="px-6 py-4"><button className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={()=>{
                                        navigate(`/add-category/${ele._id}`)
                                    }}>Edit</button></td>
                                        <td class="px-6 py-4"><button onClick={()=>{handleDelete(ele._id)}} className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Delete</button></td>
                                </tr>
                            )
                        })}
                      

            
        </tbody>
    </table>
</div>

{/*  */}

                <div>
                    <button onClick={()=>{navigate('/add-category')}} className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-green-700 transition">AddCategory</button>
                </div>
            </div>
        </div>
    )
}