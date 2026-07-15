import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverIp, setServerIp] = useState('Resolving...');

  // Poll server IP for load balancer demo
  useEffect(() => {
    const fetchServerIp = async () => {
      try {
        const res = await fetch(`${API_BASE_URL.replace('/api', '')}/api/server-info`);
        if (res.ok) {
          const data = await res.json();
          setServerIp(data.serverIp);
        }
      } catch (err) {
        console.error('Failed to poll server host address:', err);
        setServerIp('127.0.0.1 (Offline)');
      }
    };

    fetchServerIp();
    const interval = setInterval(fetchServerIp, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Brand/Title */}
        <div className="navbar-brand" onClick={() => navigate(user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login')}>
          <span style={{ fontSize: '1.75rem' }}>🎓</span>
          <span className="gradient-text">Placement Cell Automation</span>
        </div>

        {/* Load Balancer Server Host IP Tracker */}
        <div className="host-indicator">
          <span className="host-pulse"></span>
          <span>HOST IP: <strong>{serverIp}</strong></span>
        </div>

        {user && (
          <ul className="navbar-links">
            {user.role === 'student' && (
              <>
                <li>
                  <span 
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </span>
                </li>
                <li>
                  <span 
                    className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
                    onClick={() => navigate('/jobs')}
                  >
                    Jobs & Events
                  </span>
                </li>
                <li>
                  <span 
                    className={`nav-link ${isActive('/uploads') ? 'active' : ''}`}
                    onClick={() => navigate('/uploads')}
                  >
                    Uploads
                  </span>
                </li>
                <li>
                  <span 
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                    onClick={() => navigate('/profile')}
                  >
                    My Profile
                  </span>
                </li>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <li>
                  <span 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => navigate('/admin')}
                  >
                    Admin Dashboard
                  </span>
                </li>
                <li>
                  <span 
                    className={`nav-link ${isActive('/admin/jobs') ? 'active' : ''}`}
                    onClick={() => navigate('/admin/jobs')}
                  >
                    Post Jobs
                  </span>
                </li>
                <li>
                  <span 
                    className={`nav-link ${isActive('/admin/profile') ? 'active' : ''}`}
                    onClick={() => navigate('/admin/profile')}
                  >
                    Admin Profile
                  </span>
                </li>
              </>
            )}

            <li>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
