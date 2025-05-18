import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserAccount } from "../slices/accountSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function SessionBooking() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
   const dispatch = useDispatch();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentor, setMentor] = useState(null);
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
        
        setError(null);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mentorId]);

  const handleFormChange = (e, sessionId) => {
    const { name, value } = e.target;
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session._id === sessionId ? { ...session, [name]: value } : session
      )
    );
  };
  function convertTo12Hour(time24) {
  let [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
}

const rjpay = ( amount, session ) => {
  const totalAmount = amount * 100;
console.log(amount);

  const options = {
    key: "rzp_test_1jetrYAgo8VSXc",
    amount: totalAmount,
    currency: "INR",
    name: "Unimentor Book Session",
    description: "Student session booking",
    image: "https://in.bmscdn.com/webin/common/icons/logo.svg",
    handler: async () => {
      try {
        const { _id, date, startTime, endTime } = session;
        const strttime = convertTo12Hour(startTime);
        const edtime = convertTo12Hour(endTime);

        await axios.put(
          `/update-session/${_id}`,
          {
            date,
            startTime: strttime,
            endTime: edtime,
            studentId: data?._id,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        toast.success("Session booked successfully!");
        navigate("/sessions");
      } catch (error) {
        console.error("Error booking session:", error);
        toast.error("Failed to book session. Please try again.");
      }
    },
    theme: { color: "#c4242d" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
  
  const goBack = () => {
    navigate(-1);
  };

  // Format currency function for displaying the session fee
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
            <svg className="mx-auto h-16 w-16 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
                  <div>
                  <h3 className="text-xl font-bold text-gray-900">{session.topic || "Mentoring Session"}</h3>
                  {/* Display Session Fee */}
                    {session.sessionFee && (
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold text-sm">
                        {formatCurrency(session.sessionFee)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center">
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
                
                {/* Booking Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    rjpay(session?.sessionFee,session);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                    <input
                      type="date"
                      name="date"
                      value={session.date ? new Date(session.date).toISOString().split("T")[0] : ""}
                      onChange={(e) => handleFormChange(e, session._id)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={session.startTime || ""}
                        onChange={(e) => handleFormChange(e, session._id)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={session.endTime || ""}
                        onChange={(e) => handleFormChange(e, session._id)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Fee Information (for visibility) */}
                  {session.sessionFee && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Session Fee:</span>
                        <span className="text-indigo-700 font-bold">{formatCurrency(session.sessionFee)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={session.status === "booked"}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                      session.status === "booked"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {session.status === "booked" ? "Already Booked" : `Book Session ${session.sessionFee ? `(${formatCurrency(session.sessionFee)})` : ""}`}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}