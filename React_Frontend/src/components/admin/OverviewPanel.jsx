import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 8 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 24, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  value: { fontSize: 40, fontWeight: 700, color: '#1976d2' },
  label: { fontSize: 14, color: '#666', marginTop: 6 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
};

export default function OverviewPanel() {
  const [stats, setStats] = useState({ hackathons: 0, judges: 0, teams: 0, pendingTeams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/admin/hackathons'),
      axiosInstance.get('/api/admin/judges'),
      axiosInstance.get('/api/admin/teams'),
    ]).then(([h, j, t]) => {
      const teams = t.data || [];
      setStats({
        hackathons: (h.data || []).length,
        judges: (j.data || []).length,
        teams: teams.length,
        pendingTeams: teams.filter(tm => tm.acceptanceStatus === 'PENDING').length,
      });
    }).catch(err => {
      console.error("Failed to fetch overview stats:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const items = [
    { label: 'Total Hackathons', value: stats.hackathons },
    { label: 'Total Judges', value: stats.judges },
    { label: 'Total Teams', value: stats.teams },
    { label: 'Pending Teams', value: stats.pendingTeams },
  ];

  return (
    <div>
      <div style={styles.title}>Overview</div>
      <div style={styles.grid}>
        {loading ? (
          <div style={{ colSpan: 'all', textAlign: 'center', padding: 40, color: '#666' }}>Loading metrics...</div>
        ) : (
          items.map(item => (
            <div key={item.label} style={styles.card}>
              <div style={styles.value}>{item.value}</div>
              <div style={styles.label}>{item.label}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
