import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const emptyForm = { name: '', description: '', maxScore: '', weight: '', displayOrder: '' };

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, marginBottom: 24 },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 14 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 3 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box' },
  select: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box', minHeight: 60 },
  row: { display: 'flex', gap: 12 },
  btn: { padding: '8px 18px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnPrimary: { background: '#1976d2', color: '#fff' },
  btnDanger: { background: '#d32f2f', color: '#fff' },
  btnSecondary: { background: '#e0e0e0', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  error: { color: '#d32f2f', fontSize: 13, marginBottom: 10 },
};

export default function CriteriaManagerPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`).then(r => setCriteria(r.data)).catch(() => setCriteria([]));
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
      axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`).then(r => setCriteria(r.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save criteria.');
    }
  };

  const handleEdit = c => {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description || '', maxScore: c.maxScore, weight: c.weight, displayOrder: c.displayOrder });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this criterion?')) return;
    try {
      await axiosInstance.delete(`/api/admin/criteria/${id}`);
      axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`).then(r => setCriteria(r.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <div style={s.title}>Criteria Manager</div>
      <div style={s.field}>
        <label style={s.label}>Select Hackathon</label>
        <select style={s.select} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
          <option value="">-- Select --</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {selectedHackathon && (
        <>
          <div style={s.form}>
            <div style={s.formTitle}>{editId ? 'Edit Criterion' : 'Add Criterion'}</div>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Name</label>
                <input style={s.input} name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} name="description" value={form.description} onChange={handleChange} />
              </div>
              <div style={s.row}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Max Score</label>
                  <input style={s.input} type="number" name="maxScore" value={form.maxScore} onChange={handleChange} required />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Weight</label>
                  <input style={s.input} type="number" name="weight" value={form.weight} onChange={handleChange} required />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Display Order</label>
                  <input style={s.input} type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} required />
                </div>
              </div>
              <div style={s.row}>
                <button style={{ ...s.btn, ...s.btnPrimary }} type="submit">{editId ? 'Update' : 'Add'}</button>
                {editId && <button style={{ ...s.btn, ...s.btnSecondary }} type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
              </div>
            </form>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Max Score</th>
                <th style={s.th}>Weight</th>
                <th style={s.th}>Order</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map(c => (
                <tr key={c.id}>
                  <td style={s.td}>{c.name}</td>
                  <td style={s.td}>{c.maxScore}</td>
                  <td style={s.td}>{c.weight}</td>
                  <td style={s.td}>{c.displayOrder}</td>
                  <td style={s.td}>
                    <div style={s.row}>
                      <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => handleEdit(c)}>Edit</button>
                      <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
