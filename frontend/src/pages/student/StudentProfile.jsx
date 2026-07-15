import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // Form states with fallback values
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [cgpa, setCgpa] = useState(user?.cgpa !== undefined ? String(user.cgpa) : '');
  const [backlogs, setBacklogs] = useState(user?.backlogs !== undefined ? String(user.backlogs) : '');
  const [submitting, setSubmitting] = useState(false);

  const branches = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !branch || cgpa === '' || backlogs === '') return;

    setSubmitting(true);
    const result = await updateUserProfile({
      name,
      email,
      phone,
      branch,
      cgpa: Number(cgpa),
      backlogs: Number(backlogs)
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel">
        <h2 className="mb-2">Setup / Update Placement Profile</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Please update your college academics parameters accurately. This data will be used to calculate your eligibility for active jobs.
        </p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="userId">College Registration ID</label>
            <input 
              type="text" 
              id="userId"
              className="form-control"
              value={user.userId.toUpperCase()}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed', fontFamily: 'monospace', fontWeight: 'bold' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Registration ID cannot be changed.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name"
                className="form-control"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="branch">Engineering Branch</label>
              <select 
                id="branch"
                className="form-control"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="" disabled>Select your branch</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cgpa">Cumulative CGPA</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="10"
                id="cgpa"
                className="form-control"
                placeholder="e.g. 8.45"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="backlogs">Active Backlogs count</label>
              <input 
                type="number" 
                min="0"
                id="backlogs"
                className="form-control"
                placeholder="e.g. 0"
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary w-100"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={submitting}
            >
              {submitting ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              ) : (
                'Save Profile Details 💾'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
