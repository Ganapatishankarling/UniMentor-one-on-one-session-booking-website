import React from "react"
import {useState,useEffect} from "react" //importing useState from react
import {createCategory,listCategories,updateCategory} from "../slices/categorySlice.jsx" //importing slice file and its functions
import {useDispatch,useSelector} from "react-redux"
import {useNavigate,useParams} from "react-router-dom"
export default function CategoryForm(){
    const [ name,setName] = useState('')
        const dispatch = useDispatch()
        const navigate = useNavigate()
        const {id} = useParams()

        useEffect(()=>{
            dispatch(listCategories())
        },[])

        const {categories,serverError,editId}=useSelector((state)=>state.categories
)
        

        useEffect(()=>{
            if(id && categories?.length>0){
                const category = categories.find((ele)=>{
                    return ele._id == id
                })
                console.log(category)
                if(category){
                    setName(category.name)
                }
            }
        },[id,categories])

        const handleSubmit = async (e)=>{
            e.preventDefault()
            if(id){
                const category=categories.find((ele)=>{
                    return ele._id==id
                })
                const formData={...category,name:name}
                const result = await dispatch(updateCategory({id,formData}))
                if(updateCategory.fulfilled.match(result)){
                    await dispatch(listCategories())
                    navigate('/category')
                }else{
                    console.error('failed to create category')
                }
            }else{
                const formData = {name}
            const result = await dispatch(createCategory(formData))
            if(createCategory.fulfilled.match(result)){
                await dispatch(listCategories())
                navigate('/category')
            }else{
                console.error('failed to create category')
            }
            }
            
        }
    return (
        <div>
            <div>
                <div>
                    <h2>{id !== null ? 'Edit Category' : 'Add Category'}</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Enter Category Name" value={name} onChange={(e)=>{setName(e.target.value)}}/>
                        <div>
                            <button type="submit">{ id !== null ? 'Update Category' : 'Add Category'}</button>
                            </div>                    
                        </form>
                </div>
            </div>
        </div>
    )
}