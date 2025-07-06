// UnauthorizedAccess.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React from 'react';
export default function UnauthorizedAccess(){
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('token');
          
          dispatch({ type: 'users/logout' });
          
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, dispatch]);

  const handleLogoutNow = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'users/logout' });
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>Unauthorized Access</h1>
        <p style={styles.message}>
          You don't have permission to access this page.
        </p>
        <p style={styles.subMessage}>
          You will be logged out automatically in <strong>{countdown}</strong> seconds
        </p>
        <button style={styles.button} onClick={handleLogoutNow}>
          Logout Now
        </button>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progress,
              width: `${((5 - countdown) / 5) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  content: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid #e9ecef'
  },
  icon: {
    fontSize: '64px',
    marginBottom: '24px',
    opacity: 0.8
  },
  title: {
    color: '#dc3545',
    marginBottom: '16px',
    fontSize: '28px',
    fontWeight: '600'
  },
  message: {
    color: '#495057',
    marginBottom: '12px',
    fontSize: '18px',
    lineHeight: '1.5'
  },
  subMessage: {
    color: '#6c757d',
    fontSize: '16px',
    marginBottom: '30px'
  },
  button: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'background-color 0.2s'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e9ecef',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progress: {
    height: '100%',
    backgroundColor: '#dc3545',
    transition: 'width 1s linear'
  }
};