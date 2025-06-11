import React, { useState, useEffect } from 'react'
import axios from '../config/axios.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserAccount } from '../slices/accountSlice.jsx'
import { listCategories, deleteCategory } from '../slices/categorySlice.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Users, Calendar, FolderOpen, User, Edit, Trash2, Search, ChevronLeft, ChevronRight, Plus, CheckCircle, XCircle, RefreshCw} from 'lucide-react'
import { listUsers } from '../slices/userSlice.jsx'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // State management
  const [activeTab, setActiveTab] = useState('users')
  const [sessions, setSessions] = useState([])
  const [sessionLoading, setSessionLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get user account and categories from Redux
  const { data: currentUser } = useSelector((state) => state.account)
  const { categories } = useSelector((state) => state.categories)
    const { users, loading:userLoading, error } = useSelector((state) => state.users);
console.log("s",currentUser);

  // Fetch current user data and categories when component mounts
  useEffect(() => {
    dispatch(fetchUserAccount())
    dispatch(listCategories())
    dispatch(listUsers())
  }, [dispatch])

  // Fetch all sessions
  const fetchSessions = async () => {
    setSessionLoading(true)
    try {
      const response = await axios.get('/list-sessions', {
        headers: { Authorization: localStorage.getItem('token') }
      })
      setSessions(response.data)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      toast.error('Failed to load sessions')
    } finally {
      setSessionLoading(false)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
   const timer = setTimeout(()=>{
     if (currentUser?.role == 'admin') {
      // fetchUsers()
      fetchSessions()
    } else {
      navigate('/login')
      toast.error('Access denied. Admin privileges required.')
    }
   },500)
   return () => clearTimeout(timer)
  }, [currentUser, navigate])

  // Delete user function
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }
    
    try {
      await axios.delete(`/admin/users/${id}`, {
        headers: { Authorization: localStorage.getItem('token') }
      })
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error('Failed to delete user')
    }
  }

  // Delete session function
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return
    }
    
    try {
      await axios.delete(`/admin/sessions/${id}`, {
        headers: { Authorization: localStorage.getItem('token') }
      })
      toast.success('Session deleted successfully')
      fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
      toast.error('Failed to delete session')
    }
  }

  // Update session status
  const handleUpdateSessionStatus = async (id, status) => {
    try {
      await axios.put(
        `/admin/sessions/${id}/status`, 
        { status },
        { headers: { "Content-Type": "application/json", Authorization: localStorage.getItem('token') } }
      )
      toast.success(`Session status updated to ${status}`)
      fetchSessions()
    } catch (err) {
      console.error('Error updating session status:', err)
      toast.error('Failed to update session status')
    }
  }

  // Format date function
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  // Filtering and pagination logic for users
  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Filtering and pagination logic for sessions
  const filteredSessions = sessions.filter(session => {
    const matchesFilter = sessionFilter === 'all' || session.status === sessionFilter
    const matchesSearch = 
      (session.topic && session.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.mentorName && session.mentorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.studentName && session.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const indexOfLastSession = currentPage * itemsPerPage
  const indexOfFirstSession = indexOfLastSession - itemsPerPage
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession)
  const totalSessionPages = Math.ceil(filteredSessions.length / itemsPerPage)

  // Category pagination
  const currentCategories = categories?.slice(indexOfFirstUser, indexOfLastUser) || []
  const totalCategoryPages = Math.ceil((categories?.length || 0) / itemsPerPage)

  // Tab change handler - resets page number
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm('')
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // If loading
  if ((activeTab === 'users' && userLoading) || 
      (activeTab === 'sessions' && sessionLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl bg-white p-6 shadow-xl">
          <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          
          {/* Tabs */}
          <div className="mb-6 border-b">
            <button
              className={`mr-4 py-2 px-4 flex items-center ${activeTab === 'users' ? 'border-b-2 border-indigo-500 font-bold text-indigo-600' : 'text-gray-600'}`}
              onClick={() => handleTabChange('users')}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </button>
            <button
              className={`mr-4 py-2 px-4 flex items-center ${activeTab === 'sessions' ? 'border-b-2 border-indigo-500 font-bold text-indigo-600' : 'text-gray-600'}`}
              onClick={() => handleTabChange('sessions')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Sessions
            </button>
            <button
              className={`py-2 px-4 flex items-center ${activeTab === 'categories' ? 'border-b-2 border-indigo-500 font-bold text-indigo-600' : 'text-gray-600'}`}
              onClick={() => handleTabChange('categories')}
            >
              <FolderOpen className="mr-2 h-5 w-5" />
              Categories
            </button>
          </div>
          
          {/* Search and Filter Section */}
          <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-1 max-w-md items-center rounded-md border border-gray-300 bg-white px-3 py-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="ml-2 flex-1 outline-none"
              />
            </div>
            
            {activeTab === 'users' && (
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="mentor">Mentors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            )}
            
            {activeTab === 'sessions' && (
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={sessionFilter}
                  onChange={(e) => {
                    setSessionFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="all">All Sessions</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            
            {activeTab === 'categories' && (
              <button 
                onClick={() => navigate('/add-category')}
                className="flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </button>
            )}
          </div>
          
          {/* Users Content */}
          {activeTab === 'users' && (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Mobile
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentUsers.length > 0 ? currentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <User className="mr-2 h-5 w-5 text-gray-400" />
                              {user.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {user.mobile || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                                className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No users found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Users */}
                {filteredUsers.length > 0 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalUserPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    currentItems={currentUsers.length}
                  />
                )}
              </div>
            </>
          )}
          
          {/* Sessions Content */}
          {activeTab === 'sessions' && (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Topic
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Mentor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentSessions.length > 0 ? currentSessions.map((session) => (
                        <tr key={session._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <div>
                              <div className="font-medium text-gray-900">{session.date ? formatDate(session.date) : 'N/A'}</div>
                              <div className="text-xs">{session.startTime} - {session.endTime}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {session.topic || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {session?.mentorId?.name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {session?.studentId?.name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              session.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateSessionStatus(session._id, 'confirmed')}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateSessionStatus(session._id, 'cancelled')}
                                  className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Cancel
                                </button>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateSessionStatus(session._id, 'completed')}
                                  className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleDeleteSession(session._id)}
                                  className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No sessions found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Sessions */}
                {filteredSessions.length > 0 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalSessionPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredSessions.length}
                    itemsPerPage={itemsPerPage}
                    currentItems={currentSessions.length}
                  />
                )}
              </div>
            </>
          )}
          
          {/* Categories Content */}
          {activeTab === 'categories' && (
            <>
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
                      {currentCategories.length > 0 ? currentCategories.map((category) => (
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
                              onClick={() => dispatch(deleteCategory(category._id))}
                              className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            No categories found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Categories */}
                {(categories?.length > 0) && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalCategoryPages}
                    onPageChange={handlePageChange}
                    totalItems={categories.length}
                    itemsPerPage={itemsPerPage}
                    currentItems={currentCategories.length}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, currentItems }) {
  const pageNumbers = [];
  // Create an array of page numbers to display
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);
    // Show ellipsis for pages between 1 and currentPage - 1
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    // Show currentPage and adjacent pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    // Show ellipsis for pages between currentPage + 1 and last page
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    // Always show last page
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center border ${
                    currentPage === pageNumber
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  } px-4 py-2 text-sm font-medium`}
                >
                  {pageNumber}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}