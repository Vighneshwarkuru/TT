import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const emptyForm = { name: '', description: '', maxScore: '', weight: '', displayOrder: '' };

export default function CriteriaManagerPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      setLoading(true);
      axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`)
        .then(r => setCriteria(r.data))
        .catch(() => setCriteria([]))
        .finally(() => setLoading(false));
    } else {
      setCriteria([]);
    }
  }, [selectedHackathon]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const payload = { ...form, hackathonId: selectedHackathon, maxScore: parseFloat(form.maxScore), weight: parseFloat(form.weight), displayOrder: parseInt(form.displayOrder) };
    try {
      if (editId) {
        await axiosInstance.put(`/api/admin/criteria/${editId}`, payload);
      } else {
        await axiosInstance.post('/api/admin/criteria', payload);
      }
      setForm(emptyForm);
      setEditId(null);
      const res = await axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`);
      setCriteria(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save criteria definition.');
    }
  };

  const handleEdit = c => {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description || '', maxScore: c.maxScore, weight: c.weight, displayOrder: c.displayOrder });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to remove this evaluation criterion?')) return;
    try {
      await axiosInstance.delete(`/api/admin/criteria/${id}`);
      const res = await axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`);
      setCriteria(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete criteria.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Evaluation Framework</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Define the metrics and weighting used by judges to evaluate team submissions.</p>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none' }}>
        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Target Competition</label>
        <select className="input" style={{ maxWidth: '400px', background: 'white' }} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
          <option value="">Select a competition instance...</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {selectedHackathon ? (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '3rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>{editId ? 'Modify Criterion' : 'Add Metric'}</h3>
            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Metric Name</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Technical Execution" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                <textarea className="input" name="description" value={form.description} onChange={handleChange} style={{ minHeight: '80px' }} placeholder="Define what judges should look for..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Max</label>
                  <input className="input" type="number" name="maxScore" value={form.maxScore} onChange={handleChange} required placeholder="10" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Weight</label>
                  <input className="input" type="number" name="weight" value={form.weight} onChange={handleChange} required placeholder="1.0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order</label>
                  <input className="input" type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} required placeholder="1" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>{editId ? 'Update' : 'Register'}</button>
                {editId && (
                  <button className="btn" type="button" onClick={() => { setEditId(null); setForm(emptyForm); }} style={{ background: 'none', border: '1px solid var(--border)' }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Metric</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Impact</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing criteria...</td>
                  </tr>
                ) : criteria.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No criteria defined for this competition.</td>
                  </tr>
                ) : criteria.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--bg-soft)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)' }}>{c.displayOrder}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{c.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '300px' }}>{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)' }}>{c.maxScore} pts</span>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>x{c.weight} Weight</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Edit</button>
                        <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.3 }}>📏</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Framework Not Selected</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Please select a competition instance above to manage its evaluation criteria.</p>
        </div>
      )}
    </div>
  );
}
