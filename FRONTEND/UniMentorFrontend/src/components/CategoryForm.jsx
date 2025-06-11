import React,{ useState, useEffect } from 'react'
import { createCategory, listCategories, updateCategory } from '../slices/categorySlice.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
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
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
  <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {id !== null ? 'Edit Category' : 'Add Category'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input 
            type="text" 
            id="categoryName"
            placeholder="Enter Category Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="pt-2">
          <button 
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {id !== null ? 'Update Category' : 'Add Category'}
          </button>
        </div>                    
      </form>
    </div>
  </div>
</div>
    )
}