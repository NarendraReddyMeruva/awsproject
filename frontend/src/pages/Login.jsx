import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !password) return;

    setLoading(true);
    const result = await login(userId, password);
    setLoading(false);

    if (result.success) {
      if (isAdmin || userId.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const trendingTags = [
    'S3 Secure Storage',
    'DynamoDB Profiles',
    'Instant Eligibility',
    'Resume Indexing',
    'Offer Verifier',
    'CSE & ECE Drives'
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '4rem',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2rem 0'
    }}>
      
      {/* Hero Section (Mockup Inspired) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <span 
            className="badge badge-success" 
            style={{ 
              marginBottom: '1rem', 
              fontSize: '0.8rem', 
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80'
            }}
          >
            ⚡ Campus Recruitment Automation
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', 
            lineHeight: '1.15', 
            fontWeight: '800',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-heading)'
          }}>
            Master the <span style={{ color: '#86efac', textShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}>placements</span> that matter and unlock your true potential.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Automate your credentials verification, upload resumes and job offers directly to AWS S3, and check real-time eligibility scores.
          </p>
        </div>

        {/* Trending tags (GUVI design match) */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span>📈</span> Portal Utilities:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {trendingTags.map((tag) => (
              <span 
                key={tag} 
                className="tag" 
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '9999px',
                  background: 'rgba(34, 197, 94, 0.05)',
                  borderColor: 'rgba(34, 197, 94, 0.15)',
                  fontSize: '0.8rem',
                  color: '#a7f3d0'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Login Card Panel */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
          <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: '700' }}>Authentication</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your placement dashboard.
          </p>

          <div className="tabs">
            <button 
              type="button"
              className={`tab w-100 ${!isAdmin ? 'active' : ''}`}
              onClick={() => { setIsAdmin(false); setUserId(''); }}
            >
              Student Portal
            </button>
            <button 
              type="button"
              className={`tab w-100 ${isAdmin ? 'active' : ''}`}
              onClick={() => { setIsAdmin(true); setUserId(''); }}
            >
              Admin Office
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="userId">{isAdmin ? 'Admin Identifier ID' : 'College Registration Number'}</label>
              <input 
                type="text" 
                id="userId"
                className="form-control"
                placeholder={isAdmin ? "e.g. admin" : "e.g. 23B91A05I1"}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Password</label>
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

            <button 
              type="submit" 
              className="btn btn-primary w-100 mt-4" 
              disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Access Portal 🔒'}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              New applicant? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Create an account</Link>
            </p>
          )}

          {isAdmin && (
            <p className="text-center mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Demo access: use <strong>admin</strong> / <strong>admin</strong> to run the initial database setup.
            </p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Login;
