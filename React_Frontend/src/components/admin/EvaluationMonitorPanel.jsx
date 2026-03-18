import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const s = {
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 3 },
  select: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 14, minWidth: 220 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 10 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f5f5f5', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
};

export default function EvaluationMonitorPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      axiosInstance.get(`/api/admin/analytics/${selectedHackathon}`).then(r => setAnalytics(r.data)).catch(() => setAnalytics(null));
    }
  }, [selectedHackathon]);

  return (
    <div>
      <div style={s.title}>Evaluation Monitor</div>
      <div style={s.field}>
        <label style={s.label}>Select Hackathon</label>
        <select style={s.select} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
          <option value="">-- Select --</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {analytics && (
        <>
          <div style={s.section}>
            <div style={s.sectionTitle}>Judge Stats</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Judge</th>
                  <th style={s.th}>Assigned Teams</th>
                  <th style={s.th}>Evaluated Teams</th>
                  <th style={s.th}>Completion %</th>
                </tr>
              </thead>
              <tbody>
                {(analytics.judgeStats || []).map((j, i) => (
                  <tr key={i}>
                    <td style={s.td}>{j.judgeName || j.judgeId}</td>
                    <td style={s.td}>{j.assignedTeams}</td>
                    <td style={s.td}>{j.evaluatedTeams}</td>
                    <td style={s.td}>{j.completionPercentage?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Team Stats</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Team</th>
                  <th style={s.th}>Assigned Judges</th>
                  <th style={s.th}>Evaluations Received</th>
                </tr>
              </thead>
              <tbody>
                {(analytics.teamStats || []).map((t, i) => (
                  <tr key={i}>
                    <td style={s.td}>{t.teamName || t.teamId}</td>
                    <td style={s.td}>{t.assignedJudges}</td>
                    <td style={s.td}>{t.evaluationsReceived}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
