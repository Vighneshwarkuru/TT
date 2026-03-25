import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function OverviewPanel() {
  const [stats, setStats] = useState({ hackathons: 0, judges: 0, teams: 0, pendingTeams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    Promise.all([
      axiosInstance.get('/api/admin/hackathons').catch(() => ({ data: [] })),
      axiosInstance.get('/api/admin/judges').catch(() => ({ data: [] })),
      axiosInstance.get('/api/admin/teams').catch(() => ({ data: [] })),
    ]).then(([h, j, t]) => {
      if (!isMounted) return;
      const teams = t.data || [];
      const hackathons = h.data || [];
      const judges = j.data || [];
      
      setStats({
        hackathons: hackathons.length,
        judges: judges.length,
        teams: teams.length,
        pendingTeams: teams.filter(tm => tm.acceptanceStatus === 'PENDING').length,
      });
    }).catch(err => {
      console.error("Failed to fetch overview stats:", err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const items = [
    { label: 'Live Hackathons', value: stats.hackathons, icon: '🏆' },
    { label: 'Active Judges', value: stats.judges, icon: '⚖️' },
    { label: 'Total Teams', value: stats.teams, icon: '👥' },
    { label: 'Pending Review', value: stats.pendingTeams, icon: '⌛' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="card" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', border: 'none' }}>
              <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            </div>
          ))
        ) : (
          items.map(item => (
            <div key={item.label} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '1.5rem', opacity: 0.1, fontWeight: 900 }}>{item.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: '0.5rem' }}>{item.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ padding: '2rem', background: 'var(--bg-soft)', border: 'none' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Platform Status</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          All systems operational. The synchronization engine is monitoring {stats.teams} team deployments across {stats.hackathons} active competitions. 
          {stats.pendingTeams > 0 && ` There are ${stats.pendingTeams} teams awaiting administrative approval.`}
        </p>
      </div>
    </div>
  );
}
