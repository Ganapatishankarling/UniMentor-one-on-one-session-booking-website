import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserAccount } from "../slices/accountSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Calendar, Clock, X, Check } from "lucide-react";

export default function SessionBooking() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [mentorAvailability, setMentorAvailability] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchUserAccount());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sessions
        const sessionsRes = await axios.get(`/list-sessionsById/${mentorId}`);
        setSessions(sessionsRes?.data || []);
        
        // Fetch mentor availability using the correct API endpoint
        const availabilityRes = await axios.get(`/availability/mentor/${mentorId}`);
        setMentorAvailability(availabilityRes?.data); 
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setError("Mentor availability not found. Please contact the mentor to set up their availability.");
        } else {
          setError("Failed to load sessions. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (mentorId) {
      fetchData();
    }
  }, [mentorId]);

const convertTo24Hour = (time12h) => {
  if (!time12h || typeof time12h !== 'string') return '00:00';
  if (/^\d{1,2}:\d{2}$/.test(time12h.trim()) && !time12h.includes(' ')) {
    const [hours, minutes] = time12h.trim().split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  
  const [time, modifier] = time12h.trim().split(' ');
  if (!time || !modifier) return '00:00';
  
  let [hours, minutes] = time.split(':');
  if (!hours || !minutes) return '00:00';
  
  let hour24 = parseInt(hours, 10);

  if (modifier.toUpperCase() === 'AM') {
    if (hour24 === 12) {
      hour24 = 0;
    }
  } else if (modifier.toUpperCase() === 'PM') {
    if (hour24 !== 12) {
      hour24 += 12;
    }
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

  // Generate calendar days for the modal
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const isDateBlocked = (date) => {
    if (!mentorAvailability?.blockedDates) return false;
    return mentorAvailability.blockedDates.includes(formatDate(date));
  };

const isDateAvailable = (date) => {
  if (isDateBlocked(date)) return false;
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  
  // Check notice period
  const now = new Date();
  const noticeHours = mentorAvailability?.noticePeriod || 3;
  const minBookingTime = new Date(now.getTime() + (noticeHours * 60 * 60 * 1000));
  if (date < minBookingTime) return false;
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = mentorAvailability?.weeklySchedule?.[dayName];
  
  return daySchedule?.timeSlots?.length > 0 && 
         daySchedule.timeSlots.some(slot => slot.isAvailable && !slot.isBooked);
};


const getAvailableTimeSlots = (date) => {
  console.log("Getting slots for date:", date);
  
  if (!mentorAvailability || !mentorAvailability.weeklySchedule) {
    console.log("No mentor availability or weekly schedule found");
    return [];
  }
  
  // Get the day name and format the date
  let dayName;
  let formattedDate;
  if (typeof date === 'string') {
    formattedDate = date;
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  } else {
    formattedDate = formatDate(date);
    dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }
  
  
  const daySchedule = mentorAvailability.weeklySchedule[dayName];
  
  if (!daySchedule || !daySchedule.timeSlots) {
    return [];
  }
  
  // Filter slots that are available for the specific date
const availableSlots = daySchedule.timeSlots.filter((slot, index) => {
  const isGenerallyAvailable = slot.isAvailable;
  const isBookedForThisDate = slot.bookedDates && slot.bookedDates.includes(formattedDate);
  
  console.log(`Slot ${index}:`, slot, "Generally available:", isGenerallyAvailable, "Booked for date:", isBookedForThisDate);
  
  // Only check date-specific booking, not global isBooked
  return isGenerallyAvailable && !isBookedForThisDate;
});
  
  console.log("Available slots for", dayName, formattedDate, ":", availableSlots);
  return availableSlots;
};

  const openAvailabilityModal = (sessionId) => {
    setCurrentSessionId(sessionId);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedSlotIndex(null);
    setShowAvailabilityModal(true);
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setCurrentSessionId(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedSlotIndex(null);
  };

const confirmDetails = async () => {
  if (!selectedDate || !selectedTimeSlot || selectedSlotIndex === null) {
    toast.error("Please select both date and time slot");
    return;
  }

  const [year, month, day] = selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(year, month - 1, day);
  const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Update the session with selected date and time
  setSessions(prevSessions =>
    prevSessions.map(session => {
      if (session._id === currentSessionId) {
        return {
          ...session,
          date: selectedDate,
          startTime: convertTo12Hour(selectedTimeSlot.startTime),
          endTime: convertTo12Hour(selectedTimeSlot.endTime),
          selectedDateTime: {
            date: selectedDate,
            timeSlot: {
              ...selectedTimeSlot,
              startTime: convertTo12Hour(selectedTimeSlot.startTime),
              endTime: convertTo12Hour(selectedTimeSlot.endTime)
            },
            slotIndex: selectedSlotIndex,
            dayName: dayName
          }
        };
      }
      return session;
    })
  );

  closeAvailabilityModal();
  toast.success("Date and time selected successfully!");
};

  const handleChange = async(sessionId, mentorId, studentId, currency, paymentStatus, paymentMethod, transactionId, amount) => {
    try {
      const paymentData = {
        sessionId,
        mentorId,
        studentId,
        currency,
        paymentStatus,
        method: paymentMethod,
        transactionId,
        amount
      };

      const res = await axios.post("/rjpayment", paymentData);
      
      return {
        success: true,
        data: res
      };
    } catch (error) {
      console.error("Error in handleChange:", error);
      return {
        success: false,
        error: error.message || "An unknown error occurred"
      };
    }
  };

function convertTo12Hour(time24) {
  if (!time24) return "Time not available";
  
  // Handle if it's already in 12-hour format
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24;
  }
  
  let [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
}

  const formatDuration = (duration) => {
    if (!duration) return "Duration not specified";
    
    const minutes = parseInt(duration);
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes === 60) {
      return "1 hour";
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} hours`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const rjpay = (amount, session) => {
    const totalAmount = amount * 100;
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    const options = {
      key: "rzp_test_1jetrYAgo8VSXc",
      amount: totalAmount,
      currency: "INR",
      name: "Unimentor Book Session",
      description: "Student session booking",
      image: "https://in.bmscdn.com/webin/common/icons/logo.svg",

      handler: async function (response) {
        try {
          const { _id, date, startTime, endTime, mentorId, duration, topic, selectedDateTime } = session;

          // First, book the slot to prevent double booking
          if (selectedDateTime) {
        const bookingData = {
  mentorId,
  sessionId: _id,
  startTime: convertTo24Hour(startTime),
  endTime: convertTo24Hour(endTime),
  date: selectedDateTime.date,
  topic: topic || "Mentoring Session",
  slotIndex: selectedDateTime.slotIndex,
        day: selectedDateTime.dayName
};


const bookingResult = await axios.post("/create-booking", bookingData, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      if (bookingResult.status !== 201) {
        toast.error("Failed to reserve time slot. Please try again.");
        return;
      }
          }

          // Update session with booking details
          const updateData = {
            date,
            startTime,
            endTime,
            studentId: data?._id,
            status: "pending",
            duration: duration || 60,
            topic: topic || "Mentoring Session"
          };

     

        await handleChange(
      _id,
      mentorId,
      data?._id,
      "INR",
      "Success",
      "Razorpay",
      transactionId,
      amount
    );

    // Remove session from list
    setSessions(prevSessions => 
      prevSessions.filter(session => session._id !== _id)
    );

    toast.success("Session booked successfully!");
    navigate("/sessions");
  } catch (error) {
    console.error("Error booking session:", error);
    
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errorMessage = error.response.data.errors;
      toast.error(`Booking failed: ${errorMessage}`);
    } else {
      toast.error("Failed to book session. Please try again.");
    }
  }
      },

      theme: { color: "#c4242d" },
    };

    const rzp = new window.Razorpay(options);

rzp.on('payment.failed', function (response) {
  const { _id, mentorId } = session;
  
  // NO NEED to release slot manually - booking wasn't created
  
  handleChange(
    _id,
    mentorId,
    data?._id,
    "INR",
    "Failed",
    "Razorpay",
    transactionId,
    amount
  );
  toast.error("Payment failed. Please try again.");
});

    rzp.open();
  };

  const handleSubmit = (e, session) => {
    e.preventDefault();
    
    if (!session.date || !session.startTime || !session.endTime) {
      toast.error("Please select date and time first using 'See Availability'");
      return;
    }

    if (!session.selectedDateTime) {
      toast.error("Please select date and time first using 'See Availability'");
      return;
    }

    rjpay(session?.sessionFee, session);
  };

  const goBack = () => {
    navigate(-1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="text-xl font-semibold text-indigo-800">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <button 
            onClick={goBack}
            className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-900">
              {mentor ? `Sessions with ${mentor.name}` : "Available Sessions"}
            </h1>
            <p className="mt-2 text-lg text-indigo-700">
              Select a date and time to book your mentoring session
            </p>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No sessions message */}
        {sessions.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Calendar className="mx-auto h-16 w-16 text-indigo-300" />
            <div className="text-2xl font-bold text-indigo-800 mt-4 mb-2">No sessions available</div>
            <p className="text-indigo-600 text-lg">Check back later for new session times</p>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
            >
              <div className="p-6">
                {/* Session Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{session.topic || "Mentoring Session"}</h3>
                    {session.sessionFee && (
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold text-sm ml-2">
                        {formatCurrency(session.sessionFee)}
                      </div>
                    )}
                  </div>
                  
                  {/* Session Details Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(session.duration)}
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === "booked" 
                        ? "bg-green-100 text-green-800" 
                        : session.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {session.status || "Available"}
                    </span>
                  </div>
                </div>
                
                {/* Availability Selection */}
                <div className="mb-4">
                  <button
                    onClick={() => openAvailabilityModal(session._id)}
                    disabled={!mentorAvailability}
                    className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      mentorAvailability 
                        ? "border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700"
                        : "border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {mentorAvailability ? "See Availability" : "Availability Not Set"}
                  </button>
                </div>

                {/* Selected Date and Time Display */}
                {session.selectedDateTime && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">Selected Schedule</h4>
                    <div className="space-y-1 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">
                          {new Date(session.selectedDateTime.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
  <span>Time:</span>
  <span className="font-medium">
    {convertTo12Hour(session.selectedDateTime.timeSlot.startTime)} - {convertTo12Hour(session.selectedDateTime.timeSlot.endTime)}
  </span>
</div>
                    </div>
                  </div>
                )}

                {/* Session Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Session Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{formatDuration(session.duration || 60)}</span>
                    </div>
                    {session.sessionFee && (
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="font-medium text-indigo-700">{formatCurrency(session.sessionFee)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => handleSubmit(e, session)}
                  disabled={session.status === "booked" || !session.selectedDateTime}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    session.status === "booked"
                      ? "bg-gray-400 cursor-not-allowed"
                      : !session.selectedDateTime
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {session.status === "booked" 
                    ? "Already Booked" 
                    : !session.selectedDateTime
                    ? "Select Date & Time First"
                    : `Book Session ${session.sessionFee ? `(${formatCurrency(session.sessionFee)})` : ""}`
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Select Date & Time</h2>
              <button
                onClick={closeAvailabilityModal}
                className="text-white hover:text-indigo-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ←
                      </button>
                      <span className="font-medium text-gray-700 min-w-[140px] text-center">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      console.log("datecals",date);
                      
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      const isAvailable = isCurrentMonth && isDateAvailable(date);
                      const isSelected = selectedDate === formatDate(date);
                      const isPast = date < new Date().setHours(0, 0, 0, 0);

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (isAvailable) {

                              setSelectedDate(formatDate(date));
                              setSelectedTimeSlot(null);
                              setSelectedSlotIndex(null);
                            }
                          }}
                          disabled={!isAvailable || isPast}
                          className={`
                            p-2 text-sm rounded-lg transition-colors
                            ${isSelected 
                              ? 'bg-indigo-600 text-white' 
                              : isAvailable && !isPast
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : isCurrentMonth && !isPast
                              ? 'bg-red-100 text-red-800 cursor-not-allowed'
                              : 'text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
                      <span>Not Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded mr-1"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>

                {/* Time Slots Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h3>
                  
                  {selectedDate ? (
                    <div className="space-y-2">
 {getAvailableTimeSlots(new Date(selectedDate)).map((slot, index) => {
  const isBookedForSelectedDate = slot.bookedDates && slot.bookedDates.includes(selectedDate);
  return (
    <button
      key={index}
      disabled={isBookedForSelectedDate}
    type="button"
    onClick={() => {
      setSelectedTimeSlot(slot);
      setSelectedSlotIndex(index);
    }}
    className={`
      w-full p-3 text-left rounded-lg border transition-colors opacity-0.1
      ${selectedTimeSlot === slot
        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
        : 'bg-white border-gray-200 hover:bg-gray-50 '
      }
    `}
  >
    <div className="flex items-center justify-between">
      <span className="font-medium">{convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)}</span>
      {selectedTimeSlot === slot && <Check className="h-5 w-5 text-indigo-600" />} 
    </div>
  </button>
 )})}
                      
                      {getAvailableTimeSlots(new Date(selectedDate)).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No time slots available for this date</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>
              

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={closeAvailabilityModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDetails}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedDate && selectedTimeSlot
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Details
                </button>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}