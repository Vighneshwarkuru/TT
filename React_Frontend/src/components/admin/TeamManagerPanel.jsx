import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  row: { display: 'flex', gap: 8 },
  btn: { padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnSuccess: { background: '#388e3c', color: '#fff' },
  btnDanger: { background: '#d32f2f', color: '#fff' },
  badge: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  error: { color: '#d32f2f', fontSize: 13, marginBottom: 10 },
};

const statusBadge = status => {
  const colors = { ACCEPTED: '#388e3c', REJECTED: '#d32f2f', PENDING: '#f57c00' };
  return { ...s.badge, background: colors[status] || '#999', color: '#fff' };
};

export default function TeamManagerPanel() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  const load = () => axiosInstance.get('/api/admin/teams').then(r => setTeams(r.data)).catch(() => { });

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
    <div>
      <div style={s.title}>Team Manager</div>
      {error && <div style={s.error}>{error}</div>}
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Team Name</th>
            <th style={s.th}>Hackathon ID</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Members</th>
            <th style={s.th}>GitHub</th>
            <th style={s.th}>Demo</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(t => (
            <tr key={t.id}>
              <td style={s.td}>{t.teamName}</td>
              <td style={s.td}>{t.hackathonId}</td>
              <td style={s.td}><span style={statusBadge(t.acceptanceStatus)}>{t.acceptanceStatus}</span></td>
              <td style={s.td}>{t.memberCount}</td>
              <td style={s.td}>{t.githubUrl ? <a href={t.githubUrl} target="_blank" rel="noreferrer">Link</a> : '—'}</td>
              <td style={s.td}>{t.demoUrl ? <a href={t.demoUrl} target="_blank" rel="noreferrer">Link</a> : '—'}</td>
              <td style={s.td}>
                <div style={s.row}>
                  {t.acceptanceStatus === 'PENDING' && (
                    <>
                      <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => handleAccept(t.id)}>Accept</button>
                      <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleReject(t.id)}>Reject</button>
                    </>
                  )}
                  {t.acceptanceStatus !== 'PENDING' && <span style={{ fontSize: 12, color: '#777', fontStyle: 'italic' }}>No actions</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
