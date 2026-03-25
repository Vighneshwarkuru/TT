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
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Competition Architect</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '600px' }}>Define and configure the parameters for judicial evaluation cycles and participant discovery panels.</p>
            </div>
          </div>
      </header>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--bg-soft)', paddingBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{editId ? 'Modify Strategy' : 'Provision New Hackathon'}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configure the primary registration and evaluation thresholds.</p>
        </header>

        {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '2.5rem', borderLeft: '4px solid var(--error)' }}>
              {error}
            </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Competition Identity</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="Global Innovation Summit 2026" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Executive Summary</label>
                <textarea className="input" name="description" value={form.description} onChange={handleChange} style={{ minHeight: '120px' }} placeholder="Provide a high-level overview of the competition objectives and expected outcomes..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Ignition Date</label>
              <input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Completion Date</label>
              <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Registry Deadline</label>
              <input className="input" type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
            </div>
          </div>

          <div style={{ padding: '2.5rem', background: 'var(--bg-soft)', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '2rem' }}>Governance Customization</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Telemetry 01</label>
                    <input className="input" name="extraQuestion1Label" value={form.extraQuestion1Label} onChange={handleChange} placeholder="e.g. Primary Domain" style={{ background: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Telemetry 02</label>
                    <input className="input" name="extraQuestion2Label" value={form.extraQuestion2Label} onChange={handleChange} placeholder="e.g. Technology Stack" style={{ background: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Telemetry 03</label>
                    <input className="input" name="extraQuestion3Label" value={form.extraQuestion3Label} onChange={handleChange} placeholder="e.g. Portfolio Link" style={{ background: 'white' }} />
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
            <label htmlFor="isActive" style={{ fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-main)' }}>Activate Platform Interface</label>
          </div>
          
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', borderTop: '1px solid var(--bg-soft)', paddingTop: '2.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '1rem 3rem', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              {loading ? 'ARCHITECTING...' : editId ? 'SYNCHRONIZE' : 'PROVISION INSTANCE'}
            </button>
            {editId && (
              <button 
                className="btn" 
                type="button" 
                onClick={() => { setEditId(null); setForm(empty); }}
                style={{ background: 'white', border: '1px solid var(--border)', padding: '1rem 2.5rem', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.05em' }}
              >
                ABORT
              </button>
            )}
          </div>
        </form>
      </div>

      <header style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Managed Pipelines</h3>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Instance Identity</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Chronology</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {hackathons.length === 0 ? (
                <tr>
                    <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>No competition instances synchronized.</td>
                </tr>
            ) : hackathons.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--text-main)' }}>{h.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }}>{h.description}</p>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{h.startDate} &mdash;</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>{h.endDate}</p>
                  </div>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <span className={`badge ${h.isActive ? 'badge-success' : ''}`} style={{ fontSize: '0.6875rem', padding: '0.4rem 0.75rem' }}>
                    {h.isActive ? 'ACTIVE' : 'DORMANT'}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(h)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modify</button>
                    <button onClick={() => handleDelete(h.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terminate</button>
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
