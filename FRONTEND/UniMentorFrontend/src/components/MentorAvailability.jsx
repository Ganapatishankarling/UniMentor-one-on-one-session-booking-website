import React, { useState, useEffect,useMemo } from 'react';
import axios from '../config/axios'
import { Calendar, Clock, Plus, X, Save, Check, AlertCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {toast} from "react-toastify"

const convertTo24Hour = (time12h) => {
  // Return null for invalid inputs instead of default time
  if (!time12h || typeof time12h !== 'string' || time12h.trim() === '') {
    console.warn('Invalid time format:', time12h);
    return null; // Return null instead of '00:00'
  }
  
  const trimmedTime = time12h.trim();
  const [time, modifier] = trimmedTime.split(' ');
  
  // Additional safety check
  if (!time || !modifier || !['AM', 'PM'].includes(modifier.toUpperCase())) {
    console.warn('Invalid time format - missing time or modifier:', time12h);
    return null; // Return null instead of '00:00'
  }
  
  const timeParts = time.split(':');
  if (timeParts.length !== 2) {
    console.warn('Invalid time format - incorrect time parts:', time12h);
    return null;
  }
  
  let [hours, minutes] = timeParts;
  
  // Validate hours and minutes
  const hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);
  
  if (isNaN(hoursNum) || isNaN(minutesNum) || hoursNum < 1 || hoursNum > 12 || minutesNum < 0 || minutesNum > 59) {
    console.warn('Invalid time values:', time12h);
    return null;
  }
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const MentorAvailability = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [availability, setAvailability] = useState({
    bookingPeriod: 2,
    noticePeriod: 3,
    blockedDates: []
  });
  
  const [schedules, setSchedules] = useState([
    {
      id: 'default',
      name: 'Default',
      weeklySchedule: {
        monday: { timeSlots: [] },
        tuesday: { timeSlots: [] },
        wednesday: { timeSlots: [] },
        thursday: { timeSlots: [] },
        friday: { timeSlots: [] },
        saturday: { timeSlots: [] },
        sunday: { timeSlots: [] }
      }
    }
  ]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('Default');
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null)

  const convertTo12Hour = (time24h) => {
  if (!time24h || typeof time24h !== 'string') {
    return '';
  }
  
  const [hours, minutes] = time24h.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${ampm}`;
};

const validateTimeSlots = () => {
  const errors = [];
  
  Object.keys(availability.weeklySchedule).forEach(day => {
    const daySchedule = availability.weeklySchedule[day];
    
    daySchedule.timeSlots.forEach((slot, index) => {
      // Check if slot has incomplete times
      if (!slot.startTime || !slot.endTime || slot.startTime === '' || slot.endTime === '') {
        errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)} - Slot ${index + 1}: Please select both start and end times`);
      } else {
        // Check if end time is after start time
        const startTime24 = convertTo24Hour(slot.startTime);
        const endTime24 = convertTo24Hour(slot.endTime);
        
        if (startTime24 && endTime24 && startTime24 >= endTime24) {
          errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)} - Slot ${index + 1}: End time must be after start time`);
        }
      }
    });
  });
  
  return errors;
};

    const timeOptions12Hour = useMemo(() => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push(timeString);
      }
    }
    return times;
  }, []);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize component by fetching availability
  useEffect(() => {
    fetchAvailability();
  }, []);

const fetchAvailability = async () => {
  try {
    setLoading(true);
    setError('');
    
    const response = await axios.get('/availability/my', {
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
    
    // Convert API data (24-hour) to frontend format (12-hour)
    const apiData = response.data;
    const convertedData = {
      ...apiData,
      weeklySchedule: {}
    };
    
    // Convert each day's time slots to 12-hour format
    Object.keys(apiData.weeklySchedule).forEach(day => {
      convertedData.weeklySchedule[day] = {
        ...apiData.weeklySchedule[day],
        timeSlots: apiData.weeklySchedule[day].timeSlots.map(slot => ({
          ...slot,
          startTime: convertTo12Hour(slot.startTime),
          endTime: convertTo12Hour(slot.endTime),
          slotTime: `${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`,
          bookedDates: slot.bookedDates || [],
          isBooked: slot.bookedDates && slot.bookedDates.length > 0 
        }))
      };
    });
    
    setAvailability(convertedData);
    setIsInitialized(true);
  } catch (err) {
    setError('Failed to load availability data');
    console.error('Error fetching availability:', err);
  } finally {
    setLoading(false);
  }
};

const saveAvailability = async () => {
  try {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate time slots first
    const validationErrors = validateTimeSlots();
    if (validationErrors.length > 0) {
      setError(`Please fix the following issues:\n• ${validationErrors.join('\n• ')}`);
      setLoading(false);
      return;
    }
    
    const convertedWeeklySchedule = {};
    Object.keys(availability.weeklySchedule).forEach(day => {
      const daySchedule = availability.weeklySchedule[day];
      
      const validTimeSlots = daySchedule.timeSlots
        .filter(slot => {
          // Only include slots that have BOTH start and end times selected
          return slot.startTime && 
                 slot.endTime && 
                 slot.startTime !== '' && 
                 slot.endTime !== '' &&
                 slot.startTime.trim() !== '' && 
                 slot.endTime.trim() !== '';
        })
        .map(slot => ({
          // Send required fields that API expects
          startTime: convertTo24Hour(slot.startTime),
          endTime: convertTo24Hour(slot.endTime),
          isAvailable: slot.isAvailable,
          // UPDATED: Send bookedDates array instead of isBooked
          bookedDates: slot.bookedDates || [], // Send array of booked dates
          // Include API fields if they exist (for updates)
          ...(slot._id && { _id: slot._id }),
          ...(slot.sessionId && { sessionId: slot.sessionId })
        }));
      
      convertedWeeklySchedule[day] = {
        slotStatus: daySchedule.slotStatus || [],
        timeSlots: validTimeSlots
      };
    });
    
    const dataToSave = {
      bookingPeriod: availability.bookingPeriod,
      noticePeriod: availability.noticePeriod,
      reschedulePolicy: availability.reschedulePolicy,
      rescheduleTimeframe: availability.rescheduleTimeframe,
      weeklySchedule: convertedWeeklySchedule,
      blockedDates: availability.blockedDates
    };

    const response = await axios.post('/availability', dataToSave, {
      headers: {
        "Authorization": localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });

    // Convert the response back to 12-hour format for frontend
    const responseData = response.data;
    const convertedResponse = {
      ...responseData,
      weeklySchedule: {}
    };
    
    Object.keys(responseData.weeklySchedule).forEach(day => {
      convertedResponse.weeklySchedule[day] = {
        ...responseData.weeklySchedule[day],
        timeSlots: responseData.weeklySchedule[day].timeSlots.map(slot => ({
          ...slot,
          startTime: convertTo12Hour(slot.startTime),
          endTime: convertTo12Hour(slot.endTime),
          slotTime: `${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`,
          // UPDATED: Handle bookedDates from response
          bookedDates: slot.bookedDates || [],
          isBooked: slot.bookedDates && slot.bookedDates.length > 0
        }))
      };
    });

    setAvailability(convertedResponse);
    toast.success('Availability saved successfully');
    
  } catch (err) {
 toast.error('Failed to save availability');
    console.error('Error saving availability:', err);
    console.error('Error response:', err.response?.data);
  } finally {
    setLoading(false);
  }
};


  const updateDaySchedule = async (day, timeSlots) => {
  try {
    setError('');

    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: { timeSlots }
      }
    }));
    
    const config = {
      url: `/availability/day/${day}`,
      method: 'patch',
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      data: { timeSlots }
    };

    await axios(config);

  } catch (err) {
    setError('Failed to update schedule');
    console.error('Error updating day schedule:', err);
  }
};


  const manageBlockedDates = async (action, dates) => {
    try {
      setError('');
      const config = {
        url:"/availability/blocked-dates",
        method:'patch',
        headers:{
          Authorization :localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        data:{ action, dates }
      }
      await axios(config).then((response)=>{
      if (!response) {
        throw new Error('Failed to manage blocked dates');
      }
      // Update local state
      if (action === 'add') {
        setAvailability(prev => ({
          ...prev,
          blockedDates: [...new Set([...prev.blockedDates, ...dates])]
        }));
      } else if (action === 'remove') {
        setAvailability(prev => ({
          ...prev,
          blockedDates: prev.blockedDates.filter(date => !dates.includes(date))
        }));
      }
      }).catch((err)=>{
setError('Failed to manage blocked dates');
      console.error('Error managing blocked dates:', err);
      })

      
    } catch (err) {
      setError('Failed to manage blocked dates');
      console.error('Error managing blocked dates:', err);
    }
  };

const createNewSchedule = () => {
    if (newScheduleName.trim() && !schedules.some(s => s.name === newScheduleName.trim())) {
      const newSchedule = {
        id: Date.now().toString(),
        name: newScheduleName.trim(),
        weeklySchedule: {
          monday: { timeSlots: [] },
          tuesday: { timeSlots: [] },
          wednesday: { timeSlots: [] },
          thursday: { timeSlots: [] },
          friday: { timeSlots: [] },
          saturday: { timeSlots: [] },
          sunday: { timeSlots: [] }
        }
      };
      
      setSchedules(prev => [...prev, newSchedule]);
      setSelectedScheduleId(newSchedule.id);
      setNewScheduleName('');
      setShowNewScheduleModal(false);
    }
  };

  const editSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setNewScheduleName(schedule.name);
    setShowEditScheduleModal(true);
    setActiveDropdown(null);
  };

  const deleteSchedule = (scheduleId) => {
    if (schedules.length > 1) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      if (selectedScheduleId === scheduleId) {
        setSelectedScheduleId(schedules.find(s => s.id !== scheduleId)?.id || schedules[0].id);
      }
    }
    setActiveDropdown(null);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateBlocked = (date) => {
    return availability.blockedDates.includes(formatDate(date));
  };

  const toggleDateBlock = (date) => {
    const dateStr = formatDate(date);
    const action = isDateBlocked(date) ? 'remove' : 'add';
    manageBlockedDates(action, [dateStr]);
  };

// 4. Update addTimeSlot to include the new bookedDates field
const addTimeSlot = (day) => {
  const newSlot = {
    startTime: '', // Empty initially
    endTime: '',   // Empty initially
    slotTime: '',  // Will be updated when times are selected
    isAvailable: true,
    isBooked: false, // Calculated field for UI
    bookedDates: [], // UPDATED: Add empty bookedDates array
    sessionId: null
  };

  const updatedSchedule = {
    ...availability,
    weeklySchedule: {
      ...availability.weeklySchedule,
      [day]: {
        ...availability.weeklySchedule[day],
        timeSlots: [
          ...(availability.weeklySchedule[day]?.timeSlots || []),
          newSlot
        ]
      }
    }
  };

  setAvailability(updatedSchedule);
};


  const removeTimeSlot = (day, index) => {
    const currentSlots = availability.weeklySchedule[day].timeSlots;
    const updatedSlots = currentSlots.filter((_, i) => i !== index);
    updateDaySchedule(day, updatedSlots);
  };

const updateTimeSlot = (day, slotIndex, field, value) => {
  const updatedSchedule = {
    ...availability,
    weeklySchedule: {
      ...availability.weeklySchedule,
      [day]: {
        ...availability.weeklySchedule[day],
        timeSlots: availability.weeklySchedule[day]?.timeSlots?.map((slot, index) => {
          if (index === slotIndex) {
            const updatedSlot = { ...slot, [field]: value };
            
            // If updating startTime or endTime, also update slotTime
            if (field === 'startTime' || field === 'endTime') {
              const startTime = field === 'startTime' ? value : slot.startTime;
              const endTime = field === 'endTime' ? value : slot.endTime;
              
              // Only update slotTime if both times are selected and not empty
              if (startTime && endTime && startTime !== '' && endTime !== '') {
                updatedSlot.slotTime = `${startTime} - ${endTime}`;
              } else {
                updatedSlot.slotTime = '';
              }
            }
            
            return updatedSlot;
          }
          return slot;
        }) || []
      }
    }
  };
  
  setAvailability(updatedSchedule);
};

  const calendarDays = generateCalendarDays();

if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-700 font-medium">Loading availability...</span>
          </div>
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Availability</h1>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-emerald-800 mb-1">Success</h3>
                    <p className="text-sm text-emerald-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Navigation */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Schedule
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'calendar' && (
              <div className="space-y-10">
                {/* Configuration Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">

                    {/* Booking Period */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900">Booking Period</label>
                          <p className="text-sm text-gray-600 mt-1">How far in the future can attendees book</p>
                          <select 
                            className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            value={availability.bookingPeriod}
                            onChange={(e) => setAvailability(prev => ({ ...prev, bookingPeriod: parseInt(e.target.value) }))}
                          >
                            <option value={1}>1 Month</option>
                            <option value={2}>2 Months</option>
                            <option value={3}>3 Months</option>
                            <option value={6}>6 Months</option>
                            <option value={12}>12 Months</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notice Period */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Clock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900">Notice Period</label>
                          <p className="text-sm text-gray-600 mt-1">Set the minimum amount of notice that is required</p>
                          <div className="mt-3 flex space-x-3">
                            <input
                              type="number"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              value={availability.noticePeriod}
                              onChange={(e) => setAvailability(prev => ({ ...prev, noticePeriod: parseInt(e.target.value) }))}
                            />
                            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block Dates Section */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-medium text-gray-900">Block dates</h3>
                      <p className="text-sm text-gray-600 mt-1">Add dates when you will be unavailable to take calls</p>
                    </div>
                    
                    {/* Calendar */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-medium text-gray-900 text-lg">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          >
                            →
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-3">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, index) => {
                          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                          const isBlocked = isDateBlocked(date);
                          const isToday = formatDate(date) === formatDate(new Date());
                          
                          return (
                            <button
                              key={index}
                              onClick={() => isCurrentMonth && toggleDateBlock(date)}
                              className={`p-3 text-sm rounded-lg hover:bg-emerald-50 transition-colors ${
                                !isCurrentMonth 
                                  ? 'text-gray-300 cursor-default' 
                                  : isBlocked 
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                    : isToday 
                                      ? 'bg-emerald-100 text-emerald-800 font-medium'
                                      : 'text-gray-700 hover:text-emerald-700'
                              }`}
                              disabled={!isCurrentMonth}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {availability.blockedDates.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-medium text-gray-900 mb-3">Blocked Dates:</p>
                        <div className="flex flex-wrap gap-2">
                          {availability.blockedDates.map(date => (
                            <span key={date} className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg">
                              {date}
                              <button
                                onClick={() => manageBlockedDates('remove', [date])}
                                className="ml-2 hover:text-red-900 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <button 
                    onClick={saveAvailability}
                    disabled={loading}
                    className={`flex items-center px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      loading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-emerald-700 active:bg-emerald-800'
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    ) : (
                      <Save className="w-5 h-5 mr-3" />
                    )}
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-8">
                {/* Schedule Management */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Schedule Cards */}
                    <div className="flex space-x-3">
                      {schedules.map(schedule => (
                        <div
                          key={schedule.id}
                          className={`relative flex items-center px-6 py-3 rounded-xl border cursor-pointer transition-colors ${
                            selectedScheduleId === schedule.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                          }`}
                          onClick={() => setSelectedScheduleId(schedule.id)}
                        >
                          <span className="font-medium">{schedule.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === schedule.id ? null : schedule.id);
                            }}
                            className="ml-3 p-1 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {activeDropdown === schedule.id && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                              <button
                                onClick={() => editSchedule(schedule)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-emerald-50 flex items-center rounded-t-xl transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-3 text-emerald-600" />
                                Edit Schedule
                              </button>
                              {schedules.length > 1 && (
                                <button
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center text-red-600 rounded-b-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  Delete Schedule
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setShowNewScheduleModal(true)}
                      className="flex items-center px-4 py-3 text-sm border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Schedule
                    </button>
                  </div>
                  
                  <button 
                    onClick={saveAvailability}
                    disabled={loading}
                    className={`flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      loading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-emerald-700 active:bg-emerald-800'
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    ) : (
                      <Save className="w-5 h-5 mr-3" />
                    )}
                    Save
                  </button>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-6">
                  {days.map((day, dayIndex) => (
                    <div key={day} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 transition-colors"
                            checked={
                              availability.weeklySchedule[day]?.timeSlots.length > 0
                            }
                            onChange={(e) => {
                              if (!e.target.checked) {
                                // User unchecked → clear slots
                                updateDaySchedule(day, []);
                              } else {
                                // User checked → add an initial slot
                                addTimeSlot(day);
                              }
                            }}
                          />
                          <label className="text-lg font-medium text-gray-900">
                            {dayNames[dayIndex]}
                          </label>
                        </div>
                        
                        {availability.weeklySchedule[day]?.timeSlots.length > 0 && (
                          <button
                            onClick={() => addTimeSlot(day)}
                            className="flex items-center px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Time
                          </button>
                        )}
                      </div>

                      {availability.weeklySchedule[day].timeSlots.length === 0 ? (
                        <p className="text-gray-500 text-sm ml-9">Unavailable</p>
                      ) : (
                        <div className="space-y-4 ml-9">
                          {availability.weeklySchedule[day].timeSlots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center space-x-4 flex-wrap gap-y-3 bg-white p-4 rounded-lg border border-gray-200">
                              {/* Start Time Selector */}
                              <div className="flex items-center space-x-3">
                                <label className="text-sm text-gray-600 font-medium">From:</label>
                                <select
                                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  value={slot.startTime || ''}
                                  onChange={(e) => updateTimeSlot(day, slotIndex, 'startTime', e.target.value)}
                                >
                                  <option value="">Select start time</option>
                                  {timeOptions12Hour.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>

                              {/* End Time Selector */}
                              <div className="flex items-center space-x-3">
                                <label className="text-sm text-gray-600 font-medium">To:</label>
                                <select
                                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  value={slot.endTime || ''}
                                  onChange={(e) => updateTimeSlot(day, slotIndex, 'endTime', e.target.value)}
                                >
                                  <option value="">Select end time</option>
                                  {timeOptions12Hour.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* Available Checkbox */}
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 transition-colors"
                                  checked={slot.isAvailable}
                                  onChange={(e) => updateTimeSlot(day, slotIndex, 'isAvailable', e.target.checked)}
                                />
                                <label className="text-sm text-gray-600 font-medium">Available</label>
                              </div>

                              {/* Booked Status - Enhanced */}
                              {slot.bookedDates && slot.bookedDates.length > 0 && (
                                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-lg">
                                  Booked ({slot.bookedDates.length} dates)
                                </span>
                              )}
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => removeTimeSlot(day, slotIndex)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={slot.bookedDates && slot.bookedDates.length > 0}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Schedule Modal */}
        {showNewScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Create New Schedule</h3>
              <input
                type="text"
                placeholder="Schedule name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors mb-6"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowNewScheduleModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewSchedule}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default MentorAvailability;