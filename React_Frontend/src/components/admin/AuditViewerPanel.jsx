import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  filters: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: 3 },
  label: { fontSize: 12, fontWeight: 600, color: '#555' },
  input: { padding: '7px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 13 },
  btn: { padding: '8px 16px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnPrimary: { background: '#1976d2', color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 12, borderBottom: '1px solid #f0f0f0' },
  pagination: { display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' },
};

export default function AuditViewerPanel() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ userId: '', action: '', dateFrom: '', dateTo: '' });

  const load = (p = 0) => {
    const params = { page: p, size: 20 };
    if (filters.userId) params.userId = filters.userId;
    if (filters.action) params.action = filters.action;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    axiosInstance.get('/api/admin/audit-logs', { params })
      .then(r => {
        const data = r.data;
        if (data.content) {
          setLogs(data.content);
          setTotalPages(data.totalPages || 0);
        } else {
          setLogs(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setLogs([]));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);

  const handleFilter = () => { setPage(0); load(0); };

  return (
    <div>
      <div style={s.title}>Audit Log</div>
      <div style={s.filters}>
        <div style={s.field}>
          <label style={s.label}>User ID</label>
          <input style={s.input} value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} placeholder="User ID" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Action</label>
          <input style={s.input} value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} placeholder="e.g. CREATE_JUDGE" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Date From</label>
          <input style={s.input} type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Date To</label>
          <input style={s.input} type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleFilter}>Filter</button>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>ID</th>
            <th style={s.th}>User ID</th>
            <th style={s.th}>Action</th>
            <th style={s.th}>Entity Type</th>
            <th style={s.th}>Entity ID</th>
            <th style={s.th}>IP</th>
            <th style={s.th}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td style={s.td}>{log.id}</td>
              <td style={s.td}>{log.userId}</td>
              <td style={s.td}>{log.action}</td>
              <td style={s.td}>{log.entityType}</td>
              <td style={s.td}>{log.entityId}</td>
              <td style={s.td}>{log.ipAddress}</td>
              <td style={s.td}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.btn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
          <span style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button style={s.btn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}
    </div>
  );
}
