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
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Platform Overview</h3>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="card" style={{ height: '160px', border: 'none', background: 'var(--bg-soft)' }}>
              <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)' }}></div>
            </div>
          ))
        ) : (
          items.map(item => (
            <div key={item.label} className="card" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', fontSize: '1.75rem', opacity: 0.08, fontWeight: 900 }}>{item.icon}</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: '0.75rem', letterSpacing: '-0.04em' }}>{item.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-soft)', border: 'none', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', animation: 'ping 1.5s infinite' }}></div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Platform Status</h4>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '800px', fontWeight: 500 }}>
          All systems operational. Monitoring {stats.teams} teams across {stats.hackathons} active hackathons. 
          {stats.pendingTeams > 0 ? (
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}> {stats.pendingTeams} teams are currently awaiting review.</span>
          ) : " No pending teams found."}
        </p>
      </div>
    </div>
  );
}
