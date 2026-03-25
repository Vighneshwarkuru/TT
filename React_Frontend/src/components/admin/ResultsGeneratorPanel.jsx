import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function ResultsGeneratorPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      setLoading(true);
      axiosInstance.get(`/api/public/leaderboard/${selectedHackathon}`)
        .then(r => setLeaderboard(r.data))
        .catch(() => setLeaderboard([]))
        .finally(() => setLoading(false));
    } else {
      setLeaderboard([]);
    }
  }, [selectedHackathon]);

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/export/${selectedHackathon}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `verdictsphere-results-${selectedHackathon}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Data export failed.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Results Generator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Compile final rankings and distribute certified competition results.</p>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Synthesis Context</label>
          <select className="input" style={{ maxWidth: '400px', background: 'white' }} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
            <option value="">Select a competition instance...</option>
            {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        {selectedHackathon && leaderboard.length > 0 && (
          <button className="btn btn-primary" onClick={handleExport} style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem' }}>Export Certified CSV</button>
        )}
      </div>

      {selectedHackathon ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Standing</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nominee</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Composite Score</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quorum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synthesizing results engine...</td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No evaluation data available yet.</td>
                </tr>
              ) : leaderboard.map(entry => (
                <tr key={entry.teamId} style={{ borderBottom: '1px solid var(--border)', background: entry.rank <= 3 ? 'rgba(var(--accent-rgb), 0.02)' : 'transparent' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : entry.rank === 3 ? '#CD7F32' : 'var(--bg-soft)',
                      color: entry.rank <= 3 ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem',
                      boxShadow: entry.rank <= 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      {entry.rank}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: entry.rank <= 3 ? 'var(--text)' : 'var(--text-muted)' }}>{entry.teamName}</p>
                    {entry.rank <= 3 && <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Podium Finish</p>}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>{entry.weightedScore?.toFixed(3)}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{entry.judgeCount} Judges</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.3 }}>👑</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Generator Idle</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Please select a competition instance above to generate final results.</p>
        </div>
      )}
    </div>
  );
}
