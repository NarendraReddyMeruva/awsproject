import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminJobs = () => {
  const { token, API_BASE_URL, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [packageDetail, setPackageDetail] = useState('');
  const [deadline, setDeadline] = useState('');
  const [minCgpa, setMinCgpa] = useState('0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [allowedBranches, setAllowedBranches] = useState(['CSE', 'ECE']);
  const [link, setLink] = useState('');

  const branchesOptions = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA'];

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

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const handleBranchChange = (branch) => {
    if (allowedBranches.includes(branch)) {
      setAllowedBranches(allowedBranches.filter(b => b !== branch));
    } else {
      setAllowedBranches([...allowedBranches, branch]);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job opportunity?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Job opportunity deleted successfully!');
        fetchJobs();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error deleting job', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to the server', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !company || !description || !packageDetail || !deadline) {
      showToast('Please fill all fields.', 'error');
      return;
    }

    if (allowedBranches.length === 0) {
      showToast('Select at least one eligible branch.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          company,
          description,
          packageDetail,
          deadline,
          link,
          eligibilityCriteria: {
            minCgpa: Number(minCgpa),
            maxBacklogs: Number(maxBacklogs),
            allowedBranches
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Job opportunity posted successfully!');
        // Reset form
        setTitle('');
        setCompany('');
        setDescription('');
        setPackageDetail('');
        setDeadline('');
        setLink('');
        setMinCgpa('0');
        setMaxBacklogs('0');
        setAllowedBranches(['CSE', 'ECE']);
        
        // Refresh list
        fetchJobs();
      } else {
        showToast(data.message || 'Error posting job', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to the server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
      
      {/* Upload/Post Job Form */}
      <div className="glass-panel">
        <h2 className="mb-4">Post Placement Opportunity</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input 
                type="text" 
                id="company"
                className="form-control"
                placeholder="e.g. Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">Job Profile/Role</label>
              <input 
                type="text" 
                id="title"
                className="form-control"
                placeholder="e.g. Software Development Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea 
              id="description"
              className="form-control"
              rows="4"
              placeholder="Outline the roles, responsibilities, technical stacks, and other relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="package">Compensation Package</label>
              <input 
                type="text" 
                id="package"
                className="form-control"
                placeholder="e.g. 14.5 LPA"
                value={packageDetail}
                onChange={(e) => setPackageDetail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Application Deadline</label>
              <input 
                type="date" 
                id="deadline"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="link">Application / Registration Link</label>
            <input 
              type="url" 
              id="link"
              className="form-control"
              placeholder="e.g. https://careers.company.com/apply"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {/* Eligibility Specs */}
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderStyle: 'dashed', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Eligibility Parameters</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cgpa">Min CGPA required</label>
                <input 
                  type="number" 
                  step="0.1" 
                  id="cgpa" 
                  className="form-control" 
                  value={minCgpa} 
                  onChange={(e) => setMinCgpa(e.target.value)} 
                  min="0" 
                  max="10" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="backlogs">Max Active Backlogs</label>
                <input 
                  type="number" 
                  id="backlogs" 
                  className="form-control" 
                  value={maxBacklogs} 
                  onChange={(e) => setMaxBacklogs(e.target.value)} 
                  min="0" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Allowed Branches</label>
              <div className="checkbox-grid">
                {branchesOptions.map((branch) => (
                  <div key={branch} className="checkbox-group">
                    <input 
                      type="checkbox" 
                      id={`branch-${branch}`} 
                      checked={allowedBranches.includes(branch)}
                      onChange={() => handleBranchChange(branch)}
                    />
                    <label htmlFor={`branch-${branch}`} style={{ margin: 0, cursor: 'pointer' }}>{branch}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={submitting}
          >
            {submitting ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Post Opportunity 💼'}
          </button>
        </form>
      </div>

      {/* Posted Drives list */}
      <div className="glass-panel">
        <h2 className="mb-4">Active Placement Drives</h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No placement opportunities listed.</p>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job.jobId} className="job-card">
                <div className="job-header">
                  <div>
                    <span className="job-company">{job.company}</span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="badge badge-success">{job.packageDetail}</span>
                    <button 
                      onClick={() => handleDeleteJob(job.jobId)}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: 'unset', width: 'auto' }}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>

                <p className="job-description">{job.description}</p>

                {job.link && (
                  <div style={{ marginTop: '-0.5rem' }}>
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: 'auto', display: 'inline-flex' }}
                    >
                      Application Link 🔗
                    </a>
                  </div>
                )}

                <div className="job-eligibility">
                  <div className="job-eligibility-title">Eligibility Criteria:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <span>CGPA: <strong>≥ {job.eligibilityCriteria.minCgpa}</strong></span>
                    <span>Backlogs: <strong>≤ {job.eligibilityCriteria.maxBacklogs}</strong></span>
                  </div>
                  <div className="tag-list" style={{ marginTop: '0.5rem' }}>
                    {job.eligibilityCriteria.allowedBranches.map(branch => (
                      <span key={branch} className="tag">{branch}</span>
                    ))}
                  </div>
                </div>

                <div className="job-meta">
                  <div className="job-meta-item">
                    <span>📅 Apply Before: <strong>{job.deadline}</strong></span>
                  </div>
                  <div className="job-meta-item">
                    <span>⏱️ Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminJobs;
