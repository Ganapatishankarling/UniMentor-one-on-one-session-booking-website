import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Calendar, Clock, TrendingUp, TrendingDown, DollarSign, Users, 
  BookOpen, AlertCircle, CheckCircle, XCircle, Filter, Download,
  Target, Activity, Star, Timer
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAccount } from '../slices/accountSlice';
import axios from '../config/axios'

const Analytics = ({ mentorId }) => {
   const dispatch = useDispatch()
  const [analytics, setAnalytics] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [topSessions, setTopSessions] = useState([]);
  const [bookingTimeAnalytics, setBookingTimeAnalytics] = useState(null);
  const [cancellationAnalytics, setCancellationAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
 useEffect(()=>{
        dispatch(fetchUserAccount())
    },[dispatch])
    const {data} = useSelector((state)=>{
        return state.account
    })
    console.log("data",data);
    
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
  if (data?._id) {
    fetchAllAnalytics();
  }
}, [data?._id]);


  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("token",token);
      
      const headers = {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      };

      // Helper function to safely fetch and parse JSON
      
      // Fetch analytics data with proper error handling
      console.log("men",mentorId);
      
      const overview = await axios.get(`/analytics/mentor/${data?._id}`, { headers }).then(res => res.data).catch(() => null);
      const monthly = await axios.get(`/analytics/mentor/${data?._id}/monthly?year=${selectedYear}`, { headers }).then(res => res.data).catch(() => null);
      const daily = await axios.get(`/analytics/mentor/${data?._id}/daily?year=${selectedYear}&month=${selectedMonth}`, { headers }).then(res => res.data).catch(() => null);
const sessions = await axios.get(`/analytics/mentor/${data?._id}/top-sessions`, { headers }).then(res => res.data).catch(() => null);
const bookingTime = await axios.get(`/analytics/mentor/${data?._id}/booking-time`, { headers }).then(res => res.data).catch(() => null);
const cancellation = await axios.get(`/analytics/mentor/${data?._id}/cancellations`, { headers }).then(res => res.data).catch(() => null);
      // Set data only if successfully fetched
      if (overview) setAnalytics(overview);
      if (monthly) setMonthlyData(monthly);
      if (daily) setDailyData(daily);
      if (sessions) setTopSessions(Array.isArray(sessions) ? sessions : []);
      if (bookingTime) setBookingTimeAnalytics(bookingTime);
      if (cancellation) setCancellationAnalytics(cancellation);

      // If no data was fetched, show mock data for development
      // if (!overview && !monthly && !daily && !sessions && !bookingTime && !cancellation) {
      //   console.warn('No analytics data available. Using mock data for development.');
      //   setMockData();
      // }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // setMockData(); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development/testing
  // const setMockData = () => {
  //   const mockAnalytics = {
  //     overview: {
  //       totalEarnings: 15000,
  //       totalSessions: 45,
  //       totalBookings: 52,
  //       completedSessions: 40,
  //       pendingSessions: 3,
  //       cancelledSessions: 2,
  //       confirmedBookings: 48,
  //       pendingBookings: 2,
  //       cancelledBookings: 2,
  //       completedBookings: 40,
  //       averageSessionValue: 333.33,
  //       conversionRate: 76.92,
  //       thisMonthEarnings: 3500,
  //       thisMonthSessions: 12,
  //       thisMonthBookings: 15
  //     },
  //     monthlyData: Array.from({ length: 12 }, (_, i) => ({
  //       month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  //       monthName: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
  //       earnings: Math.floor(Math.random() * 3000) + 1000,
  //       sessions: Math.floor(Math.random() * 10) + 5,
  //       bookings: Math.floor(Math.random() * 12) + 6,
  //       conversionRate: Math.floor(Math.random() * 30) + 70,
  //       transactions: Math.floor(Math.random() * 8) + 4
  //     })),
  //     recentTransactions: Array.from({ length: 5 }, (_, i) => ({
  //       id: `txn_${i + 1}`,
  //       sessionId: `session_${i + 1}`,
  //       amount: (Math.random() * 500 + 200).toFixed(2),
  //       createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  //       paymentMethod: 'Razorpay'
  //     })),
  //     sessionStatusBreakdown: { completed: 40, pending: 3, cancelled: 2 },
  //     bookingStatusBreakdown: { confirmed: 48, pending: 2, cancelled: 2, completed: 40 }
  //   };

  //   const mockTopSessions = [
  //     { topic: 'JavaScript Fundamentals', sessionCount: 12, completionRate: 85.5, avgSessionFee: 350, bookingCount: 14 },
  //     { topic: 'React Development', sessionCount: 8, completionRate: 92.1, avgSessionFee: 400, bookingCount: 10 },
  //     { topic: 'Node.js Backend', sessionCount: 6, completionRate: 78.3, avgSessionFee: 450, bookingCount: 8 }
  //   ];

  //   const mockBookingTime = {
  //     dayOfWeekAnalytics: {
  //       Monday: { total: 8, completed: 6, cancelled: 1, confirmed: 7, pending: 1 },
  //       Tuesday: { total: 7, completed: 6, cancelled: 1, confirmed: 6, pending: 0 },
  //       Wednesday: { total: 9, completed: 8, cancelled: 0, confirmed: 8, pending: 1 },
  //       Thursday: { total: 6, completed: 5, cancelled: 1, confirmed: 5, pending: 0 },
  //       Friday: { total: 10, completed: 9, cancelled: 1, confirmed: 9, pending: 0 },
  //       Saturday: { total: 8, completed: 7, cancelled: 0, confirmed: 7, pending: 1 },
  //       Sunday: { total: 4, completed: 3, cancelled: 1, confirmed: 3, pending: 0 }
  //     },
  //     timeSlotAnalytics: {
  //       'Morning (6AM-12PM)': { total: 15, completed: 13, cancelled: 1, confirmed: 14, pending: 1 },
  //       'Afternoon (12PM-5PM)': { total: 20, completed: 18, cancelled: 2, confirmed: 18, pending: 0 },
  //       'Evening (5PM-9PM)': { total: 12, completed: 11, cancelled: 1, confirmed: 11, pending: 0 },
  //       'Night (9PM-6AM)': { total: 5, completed: 4, cancelled: 1, confirmed: 4, pending: 0 }
  //     }
  //   };

  //   const mockCancellation = {
  //     bookingCancellationRate: 3.8,
  //     sessionCancellationRate: 4.4,
  //     totalCancelledBookings: 2,
  //     totalCancelledSessions: 2,
  //     recentCancellations: 1,
  //     cancellationByDay: {
  //       Monday: 1,
  //       Tuesday: 0,
  //       Wednesday: 0,
  //       Thursday: 1,
  //       Friday: 0,
  //       Saturday: 0,
  //       Sunday: 0
  //     },
  //     cancellationTrend: {
  //       last30Days: 1,
  //       previous30Days: 2,
  //       trendPercentage: -50,
  //       trendDirection: 'down'
  //     }
  //   };

  //   setAnalytics(mockAnalytics);
  //   setTopSessions(mockTopSessions);
  //   setBookingTimeAnalytics(mockBookingTime);
  //   setCancellationAnalytics(mockCancellation);
  //   setMonthlyData({
  //     year: 2024,
  //     monthlyAnalytics: mockAnalytics.monthlyData,
  //     yearTotal: {
  //       earnings: mockAnalytics.monthlyData.reduce((sum, month) => sum + month.earnings, 0),
  //       sessions: mockAnalytics.monthlyData.reduce((sum, month) => sum + month.sessions, 0),
  //       bookings: mockAnalytics.monthlyData.reduce((sum, month) => sum + month.bookings, 0),
  //       transactions: mockAnalytics.monthlyData.reduce((sum, month) => sum + month.transactions, 0)
  //     }
  //   });
  //   setDailyData({
  //     year: 2024,
  //     month: new Date().getMonth() + 1,
  //     monthName: new Date().toLocaleDateString('en-US', { month: 'long' }),
  //     dailyAnalytics: Array.from({ length: 30 }, (_, i) => ({
  //       date: i + 1,
  //       fullDate: new Date(2024, new Date().getMonth(), i + 1).toISOString().split('T')[0],
  //       dayName: new Date(2024, new Date().getMonth(), i + 1).toLocaleDateString('en-US', { weekday: 'short' }),
  //       earnings: Math.floor(Math.random() * 200) + 50,
  //       sessions: Math.floor(Math.random() * 3) + 1,
  //       bookings: Math.floor(Math.random() * 4) + 1,
  //       transactions: Math.floor(Math.random() * 2) + 1
  //     })),
  //     monthTotal: { earnings: 4500, sessions: 45, bookings: 52, transactions: 38 }
  //   });
  // };

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );

  const formatCurrency = (amount) => `₹${amount?.toFixed(2) || '0.00'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show notice if using mock data
  // const usingMockData = !analytics?.overview?.totalEarnings || analytics?.overview?.totalEarnings === 15000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton id="trends" label="Trends" active={activeTab === 'trends'} onClick={setActiveTab} />
        <TabButton id="sessions" label="Sessions" active={activeTab === 'sessions'} onClick={setActiveTab} />
        <TabButton id="bookings" label="Bookings" active={activeTab === 'bookings'} onClick={setActiveTab} />
        <TabButton id="cancellations" label="Cancellations" active={activeTab === 'cancellations'} onClick={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Earnings"
              value={formatCurrency(analytics.overview.totalEarnings)}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Total Sessions"
              value={analytics.overview.totalSessions}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Total Bookings"
              value={analytics.overview.totalBookings}
              icon={Calendar}
              color="purple"
            />
            <StatCard
              title="Conversion Rate"
              value={`${analytics.overview.conversionRate}%`}
              icon={Target}
              color="orange"
            />
          </div>

          {/* This Month Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.overview.thisMonthEarnings)}</p>
                <p className="text-sm text-gray-600">Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.thisMonthSessions}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.thisMonthBookings}</p>
                <p className="text-sm text-gray-600">Bookings</p>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: analytics.sessionStatusBreakdown.completed },
                      { name: 'Pending', value: analytics.sessionStatusBreakdown.pending },
                      { name: 'Cancelled', value: analytics.sessionStatusBreakdown.cancelled }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.slice(0, 3).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Confirmed', value: analytics.bookingStatusBreakdown.confirmed },
                      { name: 'Completed', value: analytics.bookingStatusBreakdown.completed },
                      { name: 'Pending', value: analytics.bookingStatusBreakdown.pending },
                      { name: 'Cancelled', value: analytics.bookingStatusBreakdown.cancelled }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.slice(0, 4).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-600">Date</th>
                    <th className="pb-2 font-medium text-gray-600">Amount</th>
                    <th className="pb-2 font-medium text-gray-600">Session ID</th>
                    <th className="pb-2 font-medium text-gray-600">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentTransactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-2">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 font-medium text-green-600">{formatCurrency(parseFloat(transaction.amount))}</td>
                      <td className="py-2">{transaction.sessionId}</td>
                      <td className="py-2">{transaction.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'earnings' ? formatCurrency(value) : value, name]} />
                <Area type="monotone" dataKey="earnings" stackId="1" stroke="#10B981" fill="#10B981" />
                <Area type="monotone" dataKey="sessions" stackId="2" stroke="#3B82F6" fill="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Trends */}
          {dailyData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Trends - {dailyData.monthName} {dailyData.year}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData.dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Top Performing Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-600">Topic</th>
                    <th className="pb-2 font-medium text-gray-600">Sessions</th>
                    <th className="pb-2 font-medium text-gray-600">Completion Rate</th>
                    <th className="pb-2 font-medium text-gray-600">Avg Fee</th>
                    <th className="pb-2 font-medium text-gray-600">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {topSessions.map((session, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{session.topic}</td>
                      <td className="py-3">{session.sessionCount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.completionRate > 80 ? 'bg-green-100 text-green-800' :
                          session.completionRate > 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.completionRate?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3">{formatCurrency(session.avgSessionFee)}</td>
                      <td className="py-3">{session.bookingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && bookingTimeAnalytics && (
        <div className="space-y-6">
          {/* Day of Week Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Day of Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(bookingTimeAnalytics.dayOfWeekAnalytics).map(([day, data]) => ({
                day,
                total: data.total,
                completed: data.completed,
                cancelled: data.cancelled
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Slot Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Time Slot</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(bookingTimeAnalytics.timeSlotAnalytics).map(([slot, data]) => ({
                slot: slot.split(' ')[0],
                total: data.total,
                completed: data.completed,
                cancelled: data.cancelled
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="slot" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cancellations Tab */}
      {activeTab === 'cancellations' && cancellationAnalytics && (
        <div className="space-y-6">
          {/* Cancellation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Booking Cancellation Rate"
              value={`${cancellationAnalytics.bookingCancellationRate}%`}
              icon={AlertCircle}
              color="red"
            />
            <StatCard
              title="Session Cancellation Rate"
              value={`${cancellationAnalytics.sessionCancellationRate}%`}
              icon={XCircle}
              color="red"
            />
            <StatCard
              title="Recent Cancellations"
              value={cancellationAnalytics.recentCancellations}
              change={cancellationAnalytics.cancellationTrend.trendPercentage}
              icon={Timer}
              color="orange"
            />
          </div>

          {/* Cancellation by Day */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellations by Day of Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(cancellationAnalytics.cancellationByDay).map(([day, count]) => ({
                day,
                cancellations: count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cancellations" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;