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
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Judge Authority</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Provision and manage judicial accounts for evaluation cycles.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create New Authority</h3>
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>First Name</label>
                <input className="input" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Last Name</label>
                <input className="input" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Endpoint</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="judge@verdictsphere.ai" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Secure Token</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
              {submitting ? 'Provisioning...' : 'Provision Judge'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Authority Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Endpoint</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {judges.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No judicial authorities registered.</td>
                </tr>
              ) : judges.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        {j.firstName[0]}{j.lastName[0]}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{j.firstName} {j.lastName}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{j.email}</p>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(j.id)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
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
