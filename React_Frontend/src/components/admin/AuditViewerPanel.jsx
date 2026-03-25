import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function AuditViewerPanel() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ userId: '', action: '', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = (p = 0) => {
    setLoading(true);
    setError(null);
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
      .catch(err => {
        console.error("Failed to load audit logs:", err);
        setError("Failed to synchronize audit stream. Please verify your connection.");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);

  const handleFilter = (e) => { e.preventDefault(); setPage(0); load(0); };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Audit Ledger</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Immutable record of platform operations and administrative oversight.</p>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none' }}>
        <form onSubmit={handleFilter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>User ID</label>
            <input className="input" style={{ background: 'white' }} value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} placeholder="Search ID..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Operation</label>
            <input className="input" style={{ background: 'white' }} value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} placeholder="e.g. CREATE_TEAM" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Since</label>
            <input className="input" style={{ background: 'white' }} type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Until</label>
            <input className="input" style={{ background: 'white' }} type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
          </div>
          <button className="btn btn-primary" type="submit" style={{ height: '42px' }}>Refresh Ledger</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Event ID</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actor</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operation</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Context</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Origin</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Decrypting audit stream...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--error)', fontSize: '0.875rem', fontWeight: 600 }}>{error}</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No events matches your current audit filter.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <code style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{log.id}</code>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>User #{log.userId}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.625rem', letterSpacing: '0.025em' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600 }}>{log.entityType}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({log.entityId})</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <code style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{log.ipAddress}</code>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Showing page {page + 1} of {totalPages}</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn" style={{ background: 'none', border: '1px solid var(--border)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              &larr; Previous
            </button>
            <button className="btn" style={{ background: 'none', border: '1px solid var(--border)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
