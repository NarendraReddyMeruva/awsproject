import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user, token, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Error fetching job listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  if (!user) return null;

  // Compute matching/eligible jobs count
  const checkEligibility = (job) => {
    if (!user.profileCompleted) return false;
    
    const userCgpa = Number(user.cgpa || 0);
    const userBacklogs = Number(user.backlogs || 0);
    const userBranch = (user.branch || '').toUpperCase();
    
    const minCgpaMatch = userCgpa >= job.eligibilityCriteria.minCgpa;
    const backlogMatch = userBacklogs <= job.eligibilityCriteria.maxBacklogs;
    const branchMatch = job.eligibilityCriteria.allowedBranches.includes(userBranch);

    return minCgpaMatch && backlogMatch && branchMatch;
  };

  const eligibleJobsCount = jobs.filter(checkEligibility).length;

  // Completion stats
  const profileStatus = user.profileCompleted;
  const resumeStatus = !!user.resumeUrl;
  const offerLetterStatus = !!user.offerLetterUrl;

  const totalSteps = 2; // Profile and Resume are required
  const completedSteps = (profileStatus ? 1 : 0) + (resumeStatus ? 1 : 0);
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div>
      <div className="glass-panel mb-4" style={{ padding: '2.5rem' }}>
        <h1 className="mb-2">Hello, <span className="gradient-text">{user.name}</span>!</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          College Reg. ID: <strong style={{ fontFamily: 'monospace' }}>{user.userId.toUpperCase()}</strong>
        </p>

        {completionPercentage < 100 ? (
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Complete your placement setup:</span>
              <strong>{completionPercentage}% Done</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(95deg, var(--primary), var(--accent))', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        ) : (
          <div className="badge badge-success mt-4" style={{ padding: '0.5rem 1rem' }}>
            🎉 Placement Eligibility Setup Completed! You are ready to apply.
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Step checklist */}
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h2 className="mb-4">Portal Setup Checklist</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Step 1 */}
            <div className="doc-status-panel" style={{ margin: 0, opacity: profileStatus ? 0.8 : 1 }}>
              <div className="doc-info">
                <div style={{ fontSize: '1.5rem' }}>{profileStatus ? '✅' : '⚙️'}</div>
                <div className="doc-details">
                  <h4>1. Profile Details Configuration</h4>
                  <p>Branch, CGPA, backlogs counts. Stores values in DynamoDB.</p>
                </div>
              </div>
              <div>
                {profileStatus ? (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/profile')}>
                    Modify Profile
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/profile')}>
                    Configure Now 🛠️
                  </button>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="doc-status-panel" style={{ margin: 0, opacity: resumeStatus ? 0.8 : 1 }}>
              <div className="doc-info">
                <div style={{ fontSize: '1.5rem' }}>{resumeStatus ? '✅' : '📄'}</div>
                <div className="doc-details">
                  <h4>2. Upload Resume PDF</h4>
                  <p>Required for job applications. Saved at <code>students/{user.userId}/resume.pdf</code> in S3.</p>
                </div>
              </div>
              <div>
                {resumeStatus ? (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/uploads')}>
                    Update Resume
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/uploads')}>
                    Upload S3 🚀
                  </button>
                )}
              </div>
            </div>

            {/* Step 3 (Optional) */}
            <div className="doc-status-panel" style={{ margin: 0, opacity: offerLetterStatus ? 0.8 : 1 }}>
              <div className="doc-info">
                <div style={{ fontSize: '1.5rem' }}>{offerLetterStatus ? '✅' : '✉️'}</div>
                <div className="doc-details">
                  <h4>3. Upload Offer Letter (Optional)</h4>
                  <p>Track your placements. Saved at <code>students/{user.userId}/offer_letter.pdf</code> in S3.</p>
                </div>
              </div>
              <div>
                {offerLetterStatus ? (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/uploads')}>
                    Update Offer
                  </button>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/uploads')}>
                    Upload Offer 🚀
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Small statistics card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="mb-2">Opportunities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Based on your branch, CGPA, and backlog details.
            </p>
          </div>

          <div style={{ textAlignment: 'center', margin: '1rem 0' }}>
            {loading ? (
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            ) : (
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)' }}>
                {user.profileCompleted ? eligibleJobsCount : '-'}
              </div>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
              {user.profileCompleted ? 'Eligible Placement Drives' : 'Configure Profile to check eligibility'}
            </p>
          </div>

          <button 
            className="btn btn-primary w-100" 
            onClick={() => navigate('/jobs')}
            disabled={loading}
          >
            Browse Jobs Board
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
