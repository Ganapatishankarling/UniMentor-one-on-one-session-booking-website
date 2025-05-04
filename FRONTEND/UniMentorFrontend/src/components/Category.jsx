import {useEffect} from "react"
import {useSelector,useDispatch} from "react-redux"
import {listCategories,deleteCategory,assignEditId} from "../slice/CategorySlice.jsx"
import {useNavigate,Link} from "react-router-dom"
import {assignEditId} from "../slice/CategorySlice.jsx"
export default function Category(){
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const {data,serverError,editId} = useSelector((state)=>{
        return state.categories
    })
    useEffect(()=>{
        dispatch(listCategories())
    },[dispatch])

    const handleDelete = (id)=>{
        dispatch(deleteCategory(id))
    }
    return(
        <div>
            <div>
                <tabel>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((ele)=>{
                            return (
                                <tr key={ele.id}>
                                    <td>{ele.name}</td>
                                    <td><button onClick={()=>{
                                        navigate(`/add-category/${ele._id}`)
                                    }}>Edit</button><button onClick={()=>{handleDelete(ele._id)}}>Delete</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </tabel>
                <div>
                    <button onClick={()=>{navigate('/add-category')}} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">AddCategory</button>
                </div>
            </div>
        </div>
    )
}