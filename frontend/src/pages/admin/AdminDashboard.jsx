import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { token, API_BASE_URL } = useAuth();
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, cgpa-desc, cgpa-asc, regId

  const branches = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'MCA'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [studRes, jobRes] = await Promise.all([
          fetch(`${API_BASE_URL}/students`, { headers }),
          fetch(`${API_BASE_URL}/jobs`, { headers })
        ]);

        if (studRes.ok) {
          const studData = await studRes.json();
          setStudents(studData);
        }

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJobs(jobData);
        }
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Download filtered students as CSV helper
  const downloadStudentCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'Branch', 'CGPA', 'Backlogs', 'Resume S3 Link', 'Offer Letter S3 Link'];
    
    const rows = filteredStudents.map(student => [
      student.userId.toUpperCase(),
      student.name,
      student.email,
      student.phone || 'N/A',
      student.branch || 'N/A',
      student.cgpa !== undefined ? student.cgpa : 0,
      student.backlogs !== undefined ? student.backlogs : 0,
      student.resumeUrl || 'Not Uploaded',
      student.offerLetterUrl || 'Not Uploaded'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_placement_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats metrics on ALL students
  const totalStudents = students.length;
  const resumesUploaded = students.filter(s => s.resumeUrl).length;
  const offerLettersUploaded = students.filter(s => s.offerLetterUrl).length;
  const jobOpportunitiesCount = jobs.length;

  // Filter and Sort Students dynamically
  const filteredStudents = students
    .filter(student => {
      const term = searchTerm.toLowerCase();
      const matchName = student.name.toLowerCase().includes(term);
      const matchId = student.userId.toLowerCase().includes(term);
      const matchBranch = branchFilter === '' || student.branch === branchFilter;
      return (matchName || matchId) && matchBranch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'cgpa-desc') {
        return Number(b.cgpa || 0) - Number(a.cgpa || 0);
      }
      if (sortBy === 'cgpa-asc') {
        return Number(a.cgpa || 0) - Number(b.cgpa || 0);
      }
      if (sortBy === 'regId') {
        return a.userId.localeCompare(b.userId);
      }
      return 0;
    });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2">Administrative Control Hub</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Manage registered students records, inspect files uploaded to AWS S3, and review active placement drives.
      </p>

      {/* Stats Cards Dashboard */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Students Registered</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>💼</div>
          <div className="stat-info">
            <h3>{jobOpportunitiesCount}</h3>
            <p>Active Job Drives</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>📄</div>
          <div className="stat-info">
            <h3>{resumesUploaded}</h3>
            <p>Resumes in S3</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>✉️</div>
          <div className="stat-info">
            <h3>{offerLettersUploaded}</h3>
            <p>Offers Submitted</p>
          </div>
        </div>
      </div>

      {/* Students Directory with Search, Filter & Sort */}
      <div className="glass-panel">
        <div className="d-flex justify-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Student Directory</h2>
          
          {/* Download CSV button */}
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={downloadStudentCSV}
            disabled={filteredStudents.length === 0}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            📥 Download List (CSV)
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-bar">
          {/* Search bar */}
          <div className="filter-item" style={{ flex: '2', minWidth: '220px' }}>
            <input 
              type="text" 
              className="form-control"
              placeholder="Search by Name or Register ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Branch Filter dropdown */}
          <div className="filter-item">
            <select 
              className="form-control"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector dropdown */}
          <div className="filter-item">
            <select 
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="cgpa-desc">Sort by CGPA (High to Low)</option>
              <option value="cgpa-asc">Sort by CGPA (Low to High)</option>
              <option value="regId">Sort by Register ID</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing {filteredStudents.length} of {students.length} students
        </div>

        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No students found matching your criteria.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Resume S3 link</th>
                  <th>Offer S3 link</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.userId}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace', color: '#86efac' }}>
                      {student.userId.toUpperCase()}
                    </td>
                    <td>{student.name}</td>
                    <td>
                      {student.branch ? (
                        <span className="tag">{student.branch}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not Completed</span>
                      )}
                    </td>
                    <td>{student.branch ? student.cgpa : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                    <td>{student.branch ? student.backlogs : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                    <td>
                      {student.resumeUrl ? (
                        <a 
                          href={student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-success"
                          style={{ textDecoration: 'none' }}
                        >
                          View Resume 📂
                        </a>
                      ) : (
                        <span className="badge badge-danger">Not Uploaded</span>
                      )}
                    </td>
                    <td>
                      {student.offerLetterUrl ? (
                        <a 
                          href={student.offerLetterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-success"
                          style={{ textDecoration: 'none' }}
                        >
                          View Offer ✉️
                        </a>
                      ) : (
                        <span className="badge-warning badge">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
