import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function UserManagerPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>User Directory</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Platform-wide identity management and role authorization.</p>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Identifier</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Identity</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Authorization</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing user registry...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users found in the directory.</td>
              </tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <code style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{u.id}</code>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{u.firstName} {u.lastName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span className={`badge ${
                    u.role === 'ADMIN' ? 'badge-primary' : 
                    u.role === 'JUDGE' ? 'badge-accent' : 
                    'badge-success'
                  }`} style={{ fontSize: '0.625rem' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
