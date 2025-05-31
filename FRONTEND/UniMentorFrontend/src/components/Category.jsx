import React from "react"
import {useEffect} from "react"
import {useSelector,useDispatch} from "react-redux"
import {listCategories,deleteCategory} from "../slices/categorySlice.jsx"
import {useNavigate,Link} from "react-router-dom"
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
export default function Category(){
    const dispatch=useDispatch()
    const navigate=useNavigate()
   
    const {categories} = useSelector((state)=>state.categories);
    
    
    useEffect(()=>{
         dispatch(listCategories())
    },[dispatch])

    const handleDelete = (id)=>{
        dispatch(deleteCategory(id))
    }
   
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <button 
                  onClick={() => navigate('/add-category')}
                  className="flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </button>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Category Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Edit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {categories && categories?.map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                            {category._id}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {category.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <button
                              onClick={() => navigate(`/add-category/${category._id}`)}
                              className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                        <span className="font-medium">5</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="relative inline-flex items-center border border-gray-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                          1
                        </button>
                        <button className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}