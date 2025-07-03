import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { jsPDF } from 'jspdf';
import jsPDFAutoTable from 'jspdf-autotable';
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
 useEffect(()=>{
        dispatch(fetchUserAccount())
    },[dispatch])
    const {data} = useSelector((state)=>{
        return state.account
    })
    
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const exportToCSV = (data, filename) => {
  // Convert data to CSV format
  const csvContent = convertToCSV(data);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  ).join('\n');
  return `${headers}\n${rows}`;
};

const exportAnalyticsData = () => {
  if (!analytics) {
    alert('No analytics data available to export');
    return;
  }

  try {
    // Prepare data based on active tab
    switch (activeTab) {
      case 'overview':
        const overviewData = [
          {
            Metric: 'Total Earnings',
            Value: analytics.overview.totalEarnings,
            Type: 'Currency'
          },
          {
            Metric: 'Total Sessions',
            Value: analytics.overview.totalSessions,
            Type: 'Count'
          },
          {
            Metric: 'Total Bookings',
            Value: analytics.overview.totalBookings,
            Type: 'Count'
          },
          {
            Metric: 'Conversion Rate',
            Value: `${analytics.overview.conversionRate}%`,
            Type: 'Percentage'
          },
          {
            Metric: 'This Month Earnings',
            Value: analytics.overview.thisMonthEarnings,
            Type: 'Currency'
          },
          {
            Metric: 'This Month Sessions',
            Value: analytics.overview.thisMonthSessions,
            Type: 'Count'
          },
          {
            Metric: 'This Month Bookings',
            Value: analytics.overview.thisMonthBookings,
            Type: 'Count'
          }
        ];
        exportToCSV(overviewData, `analytics-overview-${selectedYear}.csv`);
        break;

      case 'trends':
        if (monthlyData && monthlyData.monthlyAnalytics) {
          const trendsData = monthlyData.monthlyAnalytics.map(month => ({
            Month: month.monthName || month.month,
            Earnings: month.earnings,
            Sessions: month.sessions,
            Bookings: month.bookings,
            'Conversion Rate': `${month.conversionRate || 0}%`,
            Transactions: month.transactions || 0
          }));
          exportToCSV(trendsData, `monthly-trends-${selectedYear}.csv`);
        } else {
          alert('No monthly trends data available');
        }
        break;

      case 'sessions':
        if (topSessions && topSessions.length > 0) {
          const sessionsData = topSessions.map(session => ({
            Topic: session.topic,
            'Session Count': session.sessionCount,
            'Completion Rate': `${session.completionRate?.toFixed(1)}%`,
            'Average Fee': session.avgSessionFee,
            'Booking Count': session.bookingCount
          }));
          exportToCSV(sessionsData, `top-sessions-${selectedYear}.csv`);
        } else {
          alert('No sessions data available');
        }
        break;

      case 'bookings':
        if (bookingTimeAnalytics) {
          // Export day of week data
          const dayData = Object.entries(bookingTimeAnalytics.dayOfWeekAnalytics).map(([day, data]) => ({
            'Day of Week': day,
            'Total Bookings': data.total,
            'Completed': data.completed,
            'Cancelled': data.cancelled,
            'Confirmed': data.confirmed,
            'Pending': data.pending
          }));
          exportToCSV(dayData, `booking-analytics-by-day-${selectedYear}.csv`);
        } else {
          alert('No booking analytics data available');
        }
        break;

      case 'cancellations':
        if (cancellationAnalytics) {
          const cancellationData = [
            {
              Metric: 'Booking Cancellation Rate',
              Value: `${cancellationAnalytics.bookingCancellationRate}%`
            },
            {
              Metric: 'Session Cancellation Rate',
              Value: `${cancellationAnalytics.sessionCancellationRate}%`
            },
            {
              Metric: 'Total Cancelled Bookings',
              Value: cancellationAnalytics.totalCancelledBookings
            },
            {
              Metric: 'Total Cancelled Sessions',
              Value: cancellationAnalytics.totalCancelledSessions
            },
            {
              Metric: 'Recent Cancellations',
              Value: cancellationAnalytics.recentCancellations
            }
          ];
          exportToCSV(cancellationData, `cancellation-analytics-${selectedYear}.csv`);
        } else {
          alert('No cancellation data available');
        }
        break;

      default:
        // Export all available data as a comprehensive report
        const allData = [
          { Section: 'Overview', Data: JSON.stringify(analytics.overview) },
          { Section: 'Monthly Data', Data: monthlyData ? JSON.stringify(monthlyData) : 'Not available' },
          { Section: 'Top Sessions', Data: topSessions ? JSON.stringify(topSessions) : 'Not available' }
        ];
        exportToCSV(allData, `complete-analytics-${selectedYear}.csv`);
    }
    
    // Show success message
    alert('Analytics data exported successfully!');
    
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data. Please try again.');
  }
};

const exportToPDF = () => {
  if (!analytics) {
    alert('No analytics data available to export');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Analytics Dashboard Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Year: ${selectedYear}`, 20, 40);
    doc.text(`Report Type: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 20, 50);

    let yPos = 70;

    // Add content based on active tab
    switch (activeTab) {
      case 'overview':
        if (analytics.overview) {
          doc.setFontSize(16);
          doc.setTextColor(59, 130, 246);
          doc.text('Overview Metrics', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Total Earnings: ${formatCurrency(analytics.overview.totalEarnings)}`, 20, yPos);
          doc.text(`Total Sessions: ${analytics.overview.totalSessions}`, 20, yPos + 10);
          doc.text(`Total Bookings: ${analytics.overview.totalBookings}`, 20, yPos + 20);
          doc.text(`Conversion Rate: ${analytics.overview.conversionRate}%`, 20, yPos + 30);
          doc.text(`This Month Earnings: ${formatCurrency(analytics.overview.thisMonthEarnings)}`, 20, yPos + 40);
          doc.text(`This Month Sessions: ${analytics.overview.thisMonthSessions}`, 20, yPos + 50);
          doc.text(`This Month Bookings: ${analytics.overview.thisMonthBookings}`, 20, yPos + 60);
          
          yPos += 80;
          
          // Session Status
          doc.setFontSize(14);
          doc.setTextColor(59, 130, 246);
          doc.text('Session Status Breakdown', 20, yPos);
          yPos += 15;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          if (analytics.sessionStatusBreakdown) {
            doc.text(`Completed: ${analytics.sessionStatusBreakdown.completed}`, 20, yPos);
            doc.text(`Pending: ${analytics.sessionStatusBreakdown.pending}`, 20, yPos + 10);
            doc.text(`Cancelled: ${analytics.sessionStatusBreakdown.cancelled}`, 20, yPos + 20);
          }
        }
        break;
        
      case 'sessions':
        if (topSessions && topSessions.length > 0) {
          doc.setFontSize(16);
          doc.setTextColor(59, 130, 246);
          doc.text('Top Performing Sessions', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          
          topSessions.slice(0, 10).forEach((session, index) => {
            doc.text(`${index + 1}. ${session.topic}`, 20, yPos);
            doc.text(`   Sessions: ${session.sessionCount}, Completion: ${session.completionRate?.toFixed(1)}%`, 25, yPos + 8);
            doc.text(`   Avg Fee: ${formatCurrency(session.avgSessionFee)}, Bookings: ${session.bookingCount}`, 25, yPos + 16);
            yPos += 25;
            
            // Add new page if needed
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
          });
        }
        break;
        
      case 'cancellations':
        if (cancellationAnalytics) {
          doc.setFontSize(16);
          doc.setTextColor(59, 130, 246);
          doc.text('Cancellation Analytics', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Booking Cancellation Rate: ${cancellationAnalytics.bookingCancellationRate}%`, 20, yPos);
          doc.text(`Session Cancellation Rate: ${cancellationAnalytics.sessionCancellationRate}%`, 20, yPos + 10);
          doc.text(`Total Cancelled Bookings: ${cancellationAnalytics.totalCancelledBookings}`, 20, yPos + 20);
          doc.text(`Total Cancelled Sessions: ${cancellationAnalytics.totalCancelledSessions}`, 20, yPos + 30);
          doc.text(`Recent Cancellations: ${cancellationAnalytics.recentCancellations}`, 20, yPos + 40);
        }
        break;

      case 'trends':
        if (monthlyData && monthlyData.monthlyAnalytics) {
          doc.setFontSize(16);
          doc.setTextColor(59, 130, 246);
          doc.text('Monthly Trends', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          
          monthlyData.monthlyAnalytics.slice(0, 12).forEach((month, index) => {
            doc.text(`${month.monthName || month.month}:`, 20, yPos);
            doc.text(`   Earnings: ${formatCurrency(month.earnings)}, Sessions: ${month.sessions}`, 25, yPos + 8);
            doc.text(`   Bookings: ${month.bookings}, Conversion: ${month.conversionRate || 0}%`, 25, yPos + 16);
            yPos += 25;
            
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
          });
        }
        break;

      case 'bookings':
        if (bookingTimeAnalytics) {
          doc.setFontSize(16);
          doc.setTextColor(59, 130, 246);
          doc.text('Booking Analytics', 20, yPos);
          yPos += 20;
          
          doc.setFontSize(14);
          doc.text('Bookings by Day of Week:', 20, yPos);
          yPos += 15;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          
          Object.entries(bookingTimeAnalytics.dayOfWeekAnalytics).forEach(([day, data]) => {
            doc.text(`${day}: Total ${data.total}, Completed ${data.completed}, Cancelled ${data.cancelled}`, 20, yPos);
            yPos += 12;
          });
        }
        break;
        
      default:
        doc.text('Please select a specific tab for detailed PDF export.', 20, yPos);
    }

    // Save the PDF
    doc.save(`analytics-${activeTab}-${selectedYear}.pdf`);
    alert('PDF exported successfully!');

  } catch (error) {
    console.error('PDF export failed:', error);
    alert(`Failed to export PDF: ${error.message}`);
  }
};

const exportOptions = [
  {
    label: 'Export as CSV',
    action: () => {
      exportAnalyticsData();
      setShowExportMenu(false);
    }
  },
  {
    label: 'Export as JSON',
    action: () => {
      exportToJSON();
      setShowExportMenu(false);
    }
  },
  {
    label: 'Export as PDF',
    action: () => {
      exportToPDF();
      setShowExportMenu(false);
    }
  }
];

const exportToJSON = () => {
  const dataToExport = {
    exportDate: new Date().toISOString(),
    selectedYear,
    activeTab,
    analytics: analytics,
    monthlyData: monthlyData,
    dailyData: dailyData,
    topSessions: topSessions,
    bookingTimeAnalytics: bookingTimeAnalytics,
    cancellationAnalytics: cancellationAnalytics
  };

  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-data-${selectedYear}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

  useEffect(() => {
  if (data?._id) {
    fetchAllAnalytics();
  }
}, [data?._id]);


  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const headers = {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      };

      // Helper function to safely fetch and parse JSON
      
      // Fetch analytics data with proper error handling
      
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


    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
<div className="relative">
  <button 
    onClick={() => setShowExportMenu(!showExportMenu)}
    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  >
    <Download className="w-4 h-4" />
    <span>Export</span>
  </button>
  
{showExportMenu && (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
    <div className="py-1">
      {exportOptions.map((option, index) => (
        <button
          key={index}
          onClick={option.action}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)}
</div>
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