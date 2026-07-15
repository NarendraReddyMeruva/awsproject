import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Password should be at least 5 characters long.');
      return;
    }

    // Simple check to make sure they are not entering a generic admin id or similar
    if (userId.toLowerCase() === 'admin') {
      setErrorMsg('Cannot register with ID "admin" as a student.');
      return;
    }

    setLoading(true);
    const result = await registerUser(userId, password, name, email);
    setLoading(false);

    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px' }}>
        <h2 className="text-center mb-2" style={{ fontSize: '1.75rem' }}>Student Registration</h2>
        <p className="text-center mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Create your profile to access job opportunities
        </p>

        {errorMsg && (
          <div className="badge badge-danger w-100 mb-4" style={{ borderRadius: '6px', padding: '0.75rem', justifyContent: 'center', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              className="form-control"
              placeholder="e.g. Amit Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              className="form-control"
              placeholder="e.g. amit.kumar@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userId">College Registration ID</label>
            <input 
              type="text" 
              id="userId"
              className="form-control"
              placeholder="e.g. 23B91A05I1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Important: This ID will determine your folder name in AWS S3 storage.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-4" 
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
