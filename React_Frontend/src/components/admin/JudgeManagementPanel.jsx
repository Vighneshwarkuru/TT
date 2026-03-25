import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const emptyForm = { email: '', password: '', firstName: '', lastName: '' };

export default function JudgeManagementPanel() {
  const [judges, setJudges] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    axiosInstance.get('/api/admin/judges')
      .then(r => setJudges(r.data))
      .catch(() => setError('Failed to synchronize judge records.'));
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/admin/judges', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create judge instance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to decommission this judge access?')) return;
    try {
      await axiosInstance.delete(`/api/admin/judges/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete judge.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Judge Authority</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '600px' }}>Provision and manage judicial accounts for official evaluation cycles and leaderboard verification.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '4rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Provision Authority</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Establish a new judicial identity.</p>
          </header>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2rem', borderLeft: '4px solid var(--error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Forename</label>
                <input className="input" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Surname</label>
                <input className="input" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Identity (Email)</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="judge@verdictsphere.ai" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Authorization (Key)</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              {submitting ? 'PROVISIONING...' : 'ESTABLISH AUTHORITY'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Authority Node</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Identity Endpoint</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {judges.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>No judicial authorities synchronized.</td>
                </tr>
              ) : judges.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '36px', height: '36px', background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 800 }}>
                        {j.firstName[0]}{j.lastName[0]}
                      </div>
                      <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{j.firstName} {j.lastName}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{j.email}</p>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(j.id)} 
                      style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      Decommission
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
