import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const StudentUploads = () => {
  const { user, token, refreshUser, API_BASE_URL, showToast } = useAuth();
  
  // Resumes States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDrag, setResumeDrag] = useState(false);

  // Offers States
  const [offerFile, setOfferFile] = useState(null);
  const [offerUploading, setOfferUploading] = useState(false);
  const [offerDrag, setOfferDrag] = useState(false);

  const handleDrag = (e, setDrag) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDrag(true);
    } else if (e.type === "dragleave") {
      setDrag(false);
    }
  };

  const handleDrop = (e, setDrag, setFile) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], setFile);
    }
  };

  const handleChange = (e, setFile) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0], setFile);
    }
  };

  const validateAndSetFile = (selectedFile, setFile) => {
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    if (!isPdf) {
      showToast('Only PDF files are allowed.', 'error');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e, type) => {
    e.preventDefault();
    const isResume = type === 'resume';
    const file = isResume ? resumeFile : offerFile;
    const setUploading = isResume ? setResumeUploading : setOfferUploading;
    const setFile = isResume ? setResumeFile : setOfferFile;
    const endpoint = isResume ? '/uploads/resume' : '/uploads/offer-letter';

    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    // Match multer name config in Express routes
    formData.append(isResume ? 'resume' : 'offer_letter', file);

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`${isResume ? 'Resume' : 'Offer Letter'} uploaded to S3 successfully!`);
        setFile(null);
        await refreshUser(); // Refresh user profile state to fetch new S3 link
      } else {
        showToast(data.message || 'Error during file upload', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to the upload server', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-2">Document Storage</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Upload your resumes and offer letters directly to secure AWS S3 bucket storage folders.
      </p>

      <div className="upload-container">
        
        {/* Resume PDF Section */}
        <div className="glass-panel">
          <h2 className="mb-2">1. Resume PDF (Required)</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Stored at: <code>students/{user.userId}/resume.pdf</code>
          </p>

          <div 
            className={`dropzone ${resumeDrag ? 'active' : ''}`}
            onDragEnter={(e) => handleDrag(e, setResumeDrag)}
            onDragOver={(e) => handleDrag(e, setResumeDrag)}
            onDragLeave={(e) => handleDrag(e, setResumeDrag)}
            onDrop={(e) => handleDrop(e, setResumeDrag, setResumeFile)}
            onClick={() => document.getElementById('resumeInput').click()}
          >
            <input 
              type="file" 
              id="resumeInput" 
              style={{ display: 'none' }} 
              accept=".pdf"
              onChange={(e) => handleChange(e, setResumeFile)}
            />
            <div className="dropzone-icon">📄</div>
            {resumeFile ? (
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{resumeFile.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(resumeFile.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <>
                <div className="dropzone-text">Drag & drop your Resume PDF, or click to browse</div>
                <div className="dropzone-hint">Only PDF format is accepted (Max 10MB)</div>
              </>
            )}
          </div>

          {resumeFile && (
            <button 
              type="button" 
              className="btn btn-primary w-100 mt-4" 
              onClick={(e) => handleUpload(e, 'resume')}
              disabled={resumeUploading}
            >
              {resumeUploading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Upload Resume to S3 🚀'}
            </button>
          )}

          {user.resumeUrl && (
            <div className="doc-status-panel">
              <div className="doc-info">
                <div className="doc-icon">📂</div>
                <div className="doc-details">
                  <h4>resume.pdf</h4>
                  <p style={{ color: 'var(--success)', fontWeight: '600' }}>Active in S3 bucket</p>
                </div>
              </div>
              <div className="doc-actions">
                <a 
                  href={user.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Download / View 🌐
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Offer Letter Section */}
        <div className="glass-panel">
          <h2 className="mb-2">2. Offer Letter PDF (Optional)</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Stored at: <code>students/{user.userId}/offer_letter.pdf</code>
          </p>

          <div 
            className={`dropzone ${offerDrag ? 'active' : ''}`}
            onDragEnter={(e) => handleDrag(e, setOfferDrag)}
            onDragOver={(e) => handleDrag(e, setOfferDrag)}
            onDragLeave={(e) => handleDrag(e, setOfferDrag)}
            onDrop={(e) => handleDrop(e, setOfferDrag, setOfferFile)}
            onClick={() => document.getElementById('offerInput').click()}
          >
            <input 
              type="file" 
              id="offerInput" 
              style={{ display: 'none' }} 
              accept=".pdf"
              onChange={(e) => handleChange(e, setOfferFile)}
            />
            <div className="dropzone-icon">✉️</div>
            {offerFile ? (
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{offerFile.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(offerFile.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <>
                <div className="dropzone-text">Drag & drop your Offer Letter PDF, or click to browse</div>
                <div className="dropzone-hint">Only PDF format is accepted (Max 10MB)</div>
              </>
            )}
          </div>

          {offerFile && (
            <button 
              type="button" 
              className="btn btn-primary w-100 mt-4" 
              onClick={(e) => handleUpload(e, 'offer')}
              disabled={offerUploading}
            >
              {offerUploading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Upload Offer Letter to S3 🚀'}
            </button>
          )}

          {user.offerLetterUrl && (
            <div className="doc-status-panel">
              <div className="doc-info">
                <div className="doc-icon" style={{ color: 'var(--primary)' }}>💼</div>
                <div className="doc-details">
                  <h4>offer_letter.pdf</h4>
                  <p style={{ color: 'var(--success)', fontWeight: '600' }}>Active in S3 bucket</p>
                </div>
              </div>
              <div className="doc-actions">
                <a 
                  href={user.offerLetterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Download / View 🌐
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentUploads;
