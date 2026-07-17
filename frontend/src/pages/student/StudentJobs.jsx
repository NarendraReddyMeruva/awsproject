import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentJobs = () => {
  const { user, token, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  const verifyEligibility = (job) => {
    if (!user || !user.profileCompleted) {
      return { eligible: false, setupRequired: true, reasons: [] };
    }

    const reasons = [];
    const userCgpa = Number(user.cgpa || 0);
    const userBacklogs = Number(user.backlogs || 0);
    const userBranch = (user.branch || '').toUpperCase();

    // Check CGPA
    if (userCgpa < job.eligibilityCriteria.minCgpa) {
      reasons.push(`Minimum CGPA required is ${job.eligibilityCriteria.minCgpa} (Your CGPA: ${userCgpa})`);
    }

    // Check Backlogs
    if (userBacklogs > job.eligibilityCriteria.maxBacklogs) {
      reasons.push(`Maximum backlogs allowed is ${job.eligibilityCriteria.maxBacklogs} (Your backlogs: ${userBacklogs})`);
    }

    // Check Branch
    if (!job.eligibilityCriteria.allowedBranches.includes(userBranch)) {
      reasons.push(`Branch '${userBranch}' is not eligible (Eligible: ${job.eligibilityCriteria.allowedBranches.join(', ')})`);
    }

    return {
      eligible: reasons.length === 0,
      setupRequired: false,
      reasons
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2">Job Openings & Placement Drives</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        View eligible drives and active campus events. Setup your profile details to see live verification.
      </p>

      {jobs.length === 0 ? (
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-secondary)' }}>No job opportunities have been posted by the placement cell yet.</p>
        </div>
      ) : (
        <div className="jobs-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {jobs.map((job) => {
            const eligibility = verifyEligibility(job);

            return (
              <div key={job.jobId} className="glass-panel job-card">
                <div className="job-header">
                  <div>
                    <span className="job-company">{job.company}</span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>
                  
                  {/* Eligibility Badges */}
                  {eligibility.setupRequired ? (
                    <span 
                      className="badge badge-warning" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/profile')}
                    >
                      Setup Profile to Verify 🛠️
                    </span>
                  ) : eligibility.eligible ? (
                    <span className="badge badge-success">Eligible to Apply ✅</span>
                  ) : (
                    <span className="badge badge-danger">Ineligible ⚠️</span>
                  )}
                </div>

                <p className="job-description">{job.description}</p>

                {/* Apply Button & Link */}
                {job.link && (
                  <div style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                    {eligibility.eligible ? (
                      <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', width: 'auto', display: 'inline-flex', textDecoration: 'none' }}
                      >
                        Apply Now 🚀
                      </a>
                    ) : (
                      <button 
                        className="btn" 
                        disabled 
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', width: 'auto', display: 'inline-flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      >
                        Apply (Ineligible) 🔒
                      </button>
                    )}
                  </div>
                )}

                {/* Job Specs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>
                  <div>💰 Package: <strong style={{ color: 'var(--text-primary)' }}>{job.packageDetail}</strong></div>
                  <div>📅 Application Deadline: <strong style={{ color: 'var(--text-primary)' }}>{job.deadline}</strong></div>
                </div>

                {/* Eligibility Requirements List */}
                <div className="job-eligibility">
                  <div className="job-eligibility-title">Job Eligibility Requirements:</div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                    <span>CGPA: <strong>≥ {job.eligibilityCriteria.minCgpa}</strong></span>
                    <span>Backlogs allowed: <strong>≤ {job.eligibilityCriteria.maxBacklogs}</strong></span>
                  </div>
                  <div className="tag-list" style={{ marginTop: '0.5rem' }}>
                    {job.eligibilityCriteria.allowedBranches.map(branch => (
                      <span key={branch} className="tag">{branch}</span>
                    ))}
                  </div>
                </div>

                {/* Rejection / Ineligibility Reasons Block */}
                {!eligibility.setupRequired && !eligibility.eligible && (
                  <div style={{ background: 'var(--danger-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--danger)', fontWeight: '600', marginBottom: '0.25rem' }}>Eligibility Issues:</div>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                      {eligibility.reasons.map((reason, idx) => (
                        <li key={idx} style={{ margin: '0.15rem 0' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
