import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            ⚙️
          </div>
          <div>
            <span className="badge badge-success">Administrator</span>
            <h2 style={{ marginTop: '0.25rem' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
        </div>

        <h3 className="mb-4" style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Admin Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Admin ID:</span>
            <strong style={{ fontFamily: 'monospace' }}>{user.userId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Permissions:</span>
            <strong>Read / Write / S3 / DynamoDB</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Session Duration:</span>
            <strong>24 Hours</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed', marginTop: '2rem', padding: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>AWS Integration Parameters</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Ensure your backend has access to DynamoDB tables (<code>PlacementPortal_Users</code>, <code>PlacementPortal_Jobs</code>) and S3 bucket policies configured.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
