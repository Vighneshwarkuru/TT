import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function TeamManagerPanel() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/api/admin/teams')
      .then(r => setTeams(r.data))
      .catch(() => setError('Failed to synchronize team data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async id => {
    try {
      await axiosInstance.put(`/api/admin/teams/${id}/accept`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept team.');
    }
  };

  const handleReject = async id => {
    try {
      await axiosInstance.put(`/api/admin/teams/${id}/reject`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject team.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Team Registry</h2>
        <button onClick={load} className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700 }}>Refresh</button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', borderLeft: '4px solid var(--error)' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Identifier</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Context</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assets</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing Registry...</td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active team registrations found.</td>
              </tr>
            ) : teams.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{t.teamName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.memberCount} Members Assigned</p>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID: {t.hackathonId}</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span className={`badge ${
                    t.acceptanceStatus === 'ACCEPTED' ? 'badge-success' : 
                    t.acceptanceStatus === 'REJECTED' ? '' : // Default for rejected
                    ''
                  }`} style={{ fontSize: '0.625rem' }}>
                    {t.acceptanceStatus}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {t.githubUrl && <a href={t.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Source</a>}
                    {t.demoUrl && <a href={t.demoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Demo</a>}
                    {!t.githubUrl && !t.demoUrl && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>&mdash;</span>}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  {t.acceptanceStatus === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleAccept(t.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Approve</button>
                      <button onClick={() => handleReject(t.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>Reject</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
