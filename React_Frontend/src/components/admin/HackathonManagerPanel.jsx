import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const empty = { name: '', description: '', startDate: '', endDate: '', registrationDeadline: '', isActive: false };

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, marginBottom: 24 },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 14 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 3 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box', minHeight: 70 },
  row: { display: 'flex', gap: 12 },
  btn: { padding: '8px 18px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnPrimary: { background: '#1976d2', color: '#fff' },
  btnDanger: { background: '#d32f2f', color: '#fff' },
  btnSecondary: { background: '#e0e0e0', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  error: { color: '#d32f2f', fontSize: 13, marginBottom: 10 },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8 },
};

export default function HackathonManagerPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || 'Failed to save hackathon.');
    }
  };

  const handleEdit = h => {
    setEditId(h.id);
    setForm({ name: h.name, description: h.description || '', startDate: h.startDate || '', endDate: h.endDate || '', registrationDeadline: h.registrationDeadline || '', isActive: h.isActive || false });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this hackathon?')) return;
    try {
      await axiosInstance.delete(`/api/admin/hackathons/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <div style={s.title}>Hackathon Manager</div>
      <div style={s.form}>
        <div style={s.formTitle}>{editId ? 'Edit Hackathon' : 'Create Hackathon'}</div>
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
              <label style={s.label}>Start Date</label>
              <input style={s.input} type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>End Date</label>
              <input style={s.input} type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Registration Deadline</label>
              <input style={s.input} type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
            </div>
          </div>
          <div style={{ ...s.field, ...s.checkRow }}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
            <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 600 }}>Active</label>
          </div>
          <div style={s.row}>
            <button style={{ ...s.btn, ...s.btnPrimary }} type="submit">{editId ? 'Update' : 'Create'}</button>
            {editId && <button style={{ ...s.btn, ...s.btnSecondary }} type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Name</th>
            <th style={s.th}>Start</th>
            <th style={s.th}>End</th>
            <th style={s.th}>Active</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hackathons.map(h => (
            <tr key={h.id}>
              <td style={s.td}>{h.name}</td>
              <td style={s.td}>{h.startDate}</td>
              <td style={s.td}>{h.endDate}</td>
              <td style={s.td}>{h.isActive ? 'Yes' : 'No'}</td>
              <td style={s.td}>
                <div style={s.row}>
                  <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => handleEdit(h)}>Edit</button>
                  <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(h.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
