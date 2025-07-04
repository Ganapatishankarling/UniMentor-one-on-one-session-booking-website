import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { listCategories, deleteCategory } from "../slices/categorySlice.jsx";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2, FolderOpen, AlertCircle } from "lucide-react";

export default function Category() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading, error } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(listCategories());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteCategory(id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading categories...</div>
          <p className="text-gray-600 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Categories Management</h1>
          <p className="text-gray-600 text-lg">Organize and manage your content categories</p>
        </div>

        {/* Action Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
                <div className="ml-4 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
                  {categories?.length || 0} {categories?.length === 1 ? 'category' : 'categories'}
                </div>
              </div>
              <button
                onClick={() => navigate('/add-category')}
                className="flex items-center bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Category
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Content */}
        {categories && categories.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category, index) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mr-3 border-2 border-emerald-200">
                            <FolderOpen className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="text-lg font-semibold text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => navigate(`/add-category/${category._id}`)}
                            className="inline-flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-blue-200 hover:border-blue-300"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="inline-flex items-center bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {categories.map((category, index) => (
                <div key={category._id} className="border-b border-gray-100 last:border-b-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mr-3 border-2 border-emerald-200">
                          <FolderOpen className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">ID: #{index + 1}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/add-category/${category._id}`)}
                        className="flex-1 inline-flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-blue-200"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex-1 inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-red-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200">
                    Showing <span className="font-semibold text-emerald-600">1</span> to{' '}
                    <span className="font-semibold text-emerald-600">{categories.length}</span> of{' '}
                    <span className="font-semibold text-emerald-600">{categories.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-emerald-300 bg-emerald-50 rounded-lg text-sm font-medium text-emerald-600">
                    1
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">No categories found</div>
            <p className="text-gray-600 text-lg mb-6">Get started by creating your first category</p>
            <button
              onClick={() => navigate('/add-category')}
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}