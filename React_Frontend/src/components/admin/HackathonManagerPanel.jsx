import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const empty = { 
  name: '', 
  description: '', 
  startDate: '', 
  endDate: '', 
  registrationDeadline: '', 
  isActive: false,
  extraQuestion1Label: '',
  extraQuestion2Label: '',
  extraQuestion3Label: ''
};

export default function HackathonManagerPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    axiosInstance.get('/api/admin/hackathons')
      .then(r => setHackathons(r.data))
      .catch(() => setError('Failed to synchronize competition data.'));
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editId) {
        await axiosInstance.put(`/api/admin/hackathons/${editId}`, form);
      } else {
        await axiosInstance.post('/api/admin/hackathons', form);
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save competition parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = h => {
    setEditId(h.id);
    setForm({ 
      name: h.name, 
      description: h.description || '', 
      startDate: h.startDate || '', 
      endDate: h.endDate || '', 
      registrationDeadline: h.registrationDeadline || '', 
      isActive: h.isActive || false,
      extraQuestion1Label: h.extraQuestion1Label || '',
      extraQuestion2Label: h.extraQuestion2Label || '',
      extraQuestion3Label: h.extraQuestion3Label || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to terminate this competition instance?')) return;
    try {
      await axiosInstance.delete(`/api/admin/hackathons/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete hackathon.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Competition Architect</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Define and configure the parameters for judicial evaluation cycles.</p>
      </header>

      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem' }}>{editId ? 'Modify Instance' : 'Provision New Hackathon'}</h3>
        {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
              {error}
            </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Competition Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="Global Innovation Summit 2026" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Executive Summary</label>
            <textarea className="input" name="description" value={form.description} onChange={handleChange} style={{ minHeight: '100px' }} placeholder="Provide a high-level overview of the competition objectives..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ignition Date</label>
              <input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Completion Date</label>
              <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Registry Deadline</label>
              <input className="input" type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
            </div>
          </div>

          <div style={{ padding: '2rem', background: 'var(--bg-soft)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '1.5rem' }}>Governance Customization</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Telemetry Field #1</label>
                    <input className="input" name="extraQuestion1Label" value={form.extraQuestion1Label} onChange={handleChange} placeholder="e.g. Primary Domain" style={{ background: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Telemetry Field #2</label>
                    <input className="input" name="extraQuestion2Label" value={form.extraQuestion2Label} onChange={handleChange} placeholder="e.g. Technology Stack" style={{ background: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Telemetry Field #3</label>
                    <input className="input" name="extraQuestion3Label" value={form.extraQuestion3Label} onChange={handleChange} placeholder="e.g. Portfolio Link" style={{ background: 'white' }} />
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
            <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Activate Public Interface</label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '0.75rem 2.5rem' }}>
              {loading ? 'Processing...' : editId ? 'Synchronize' : 'Provision'}
            </button>
            {editId && (
              <button 
                className="btn" 
                type="button" 
                onClick={() => { setEditId(null); setForm(empty); }}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '0.75rem 2rem' }}
              >
                Abort
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Instance Identity</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Chronology</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {hackathons.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>{h.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{h.description}</p>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>{h.startDate} &mdash; {h.endDate}</p>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span className={`badge ${h.isActive ? 'badge-success' : ''}`} style={{ fontSize: '0.625rem' }}>
                    {h.isActive ? 'ACTIVE' : 'DORMANT'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(h)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Modify</button>
                    <button onClick={() => handleDelete(h.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Terminate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
