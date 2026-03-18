import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const emptyForm = { email: '', password: '', firstName: '', lastName: '' };

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  form: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, marginBottom: 24 },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 14 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 3 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, boxSizing: 'border-box' },
  row: { display: 'flex', gap: 12 },
  btn: { padding: '8px 18px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnPrimary: { background: '#1976d2', color: '#fff' },
  btnDanger: { background: '#d32f2f', color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  error: { color: '#d32f2f', fontSize: 13, marginBottom: 10 },
};

export default function JudgeManagementPanel() {
  const [judges, setJudges] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => axiosInstance.get('/api/admin/judges').then(r => setJudges(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/api/admin/judges', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create judge.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this judge?')) return;
    try {
      await axiosInstance.delete(`/api/admin/judges/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <div style={s.title}>Judge Management</div>
      <div style={s.form}>
        <div style={s.formTitle}>Create Judge</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>First Name</label>
              <input style={s.input} name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Last Name</label>
              <input style={s.input} name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button style={{ ...s.btn, ...s.btnPrimary }} type="submit">Create Judge</button>
        </form>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>ID</th>
            <th style={s.th}>Name</th>
            <th style={s.th}>Email</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {judges.map(j => (
            <tr key={j.id}>
              <td style={s.td}>{j.id}</td>
              <td style={s.td}>{j.firstName} {j.lastName}</td>
              <td style={s.td}>{j.email}</td>
              <td style={s.td}>
                <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(j.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
