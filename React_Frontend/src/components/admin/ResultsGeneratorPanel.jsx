import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 3 },
  select: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, minWidth: 220 },
  btn: { padding: '8px 18px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 16 },
  btnPrimary: { background: '#1976d2', color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  rank1: { fontWeight: 700, color: '#f57c00' },
};

export default function ResultsGeneratorPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      axiosInstance.get(`/api/public/leaderboard/${selectedHackathon}`).then(r => setLeaderboard(r.data)).catch(() => setLeaderboard([]));
    }
  }, [selectedHackathon]);

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/export/${selectedHackathon}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaderboard-${selectedHackathon}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed.');
    }
  };

  return (
    <div>
      <div style={s.title}>Results Generator</div>
      <div style={s.field}>
        <label style={s.label}>Select Hackathon</label>
        <select style={s.select} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
          <option value="">-- Select --</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {selectedHackathon && (
        <>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleExport}>Export CSV</button>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Rank</th>
                <th style={s.th}>Team</th>
                <th style={s.th}>Weighted Score</th>
                <th style={s.th}>Judges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr key={entry.teamId}>
                  <td style={{ ...s.td, ...(entry.rank === 1 ? s.rank1 : {}) }}>#{entry.rank}</td>
                  <td style={s.td}>{entry.teamName}</td>
                  <td style={s.td}>{entry.weightedScore?.toFixed(4)}</td>
                  <td style={s.td}>{entry.judgeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
