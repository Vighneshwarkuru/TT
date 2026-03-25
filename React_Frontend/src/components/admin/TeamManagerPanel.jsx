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
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Team Registry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Authorize and manage high-stakes competitive alliances.</p>
        </div>
        <button onClick={load} className="btn" style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.05em' }}>REFRESH REGISTRY</button>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '2.5rem', borderLeft: '4px solid var(--error)' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Alliance Identity</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Operational Context</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Authorization Status</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>External Assets</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>SYNCHRONIZING REGISTRY...</td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>No active alliance registrations synchronized.</td>
              </tr>
            ) : teams.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--text-main)' }}>{t.teamName}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.memberCount} Operational Units</p>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <span className="badge" style={{ fontSize: '0.625rem', padding: '0.375rem 0.75rem', fontWeight: 800 }}>CONTEXT-{t.hackathonId}</span>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <span className={`badge ${
                    t.acceptanceStatus === 'ACCEPTED' ? 'badge-success' : 
                    t.acceptanceStatus === 'REJECTED' ? 'badge-error' : 
                    ''
                  }`} style={{ fontSize: '0.6875rem', padding: '0.4rem 0.75rem', fontWeight: 800 }}>
                    {t.acceptanceStatus}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {t.githubUrl && <a href={t.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.05em' }}>SOURCE</a>}
                    {t.demoUrl && <a href={t.demoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.05em' }}>DEMO</a>}
                    {!t.githubUrl && !t.demoUrl && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>&mdash;</span>}
                  </div>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                  {t.acceptanceStatus === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleAccept(t.id)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', fontWeight: 800 }}>AUTHORIZE</button>
                      <button onClick={() => handleReject(t.id)} className="btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--border)', fontWeight: 800 }}>DECLINE</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>REGISTRY LOCKED</span>
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
