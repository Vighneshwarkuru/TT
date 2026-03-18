import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  badge: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
};

const roleBadge = role => {
  const colors = { ADMIN: '#1976d2', JUDGE: '#7b1fa2', PARTICIPANT: '#388e3c' };
  return { ...s.badge, background: colors[role] || '#999', color: '#fff' };
};

export default function UserManagerPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div style={s.title}>All Users</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>ID</th>
            <th style={s.th}>Name</th>
            <th style={s.th}>Email</th>
            <th style={s.th}>Role</th>
            <th style={s.th}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={s.td}>{u.id}</td>
              <td style={s.td}>{u.firstName} {u.lastName}</td>
              <td style={s.td}>{u.email}</td>
              <td style={s.td}><span style={roleBadge(u.role)}>{u.role}</span></td>
              <td style={s.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
