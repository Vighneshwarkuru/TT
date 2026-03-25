import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function EvaluationMonitorPanel() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/admin/hackathons').then(r => setHackathons(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      setLoading(true);
      axiosInstance.get(`/api/admin/analytics/${selectedHackathon}`)
        .then(r => setAnalytics(r.data))
        .catch(() => setAnalytics(null))
        .finally(() => setLoading(false));
    } else {
      setAnalytics(null);
    }
  }, [selectedHackathon]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Evaluation Monitor</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Real-time telemetry on judge progress and submission coverage.</p>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '3rem', background: 'var(--bg-soft)', border: 'none' }}>
        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Observation Context</label>
        <select className="input" style={{ maxWidth: '400px', background: 'white' }} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
          <option value="">Select a competition instance...</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {analytics ? (
        <div style={{ display: 'grid', gap: '3rem' }}>
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Judicial Throughput
              <span className="badge" style={{ fontSize: '0.625rem' }}>{analytics.judgeStats?.length || 0} Judges</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {(analytics.judgeStats || []).map((j, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{j.judgeName || `Judge #${j.judgeId}`}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to {j.assignedTeams} Teams</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{j.evaluatedTeams}</p>
                      <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</p>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-soft)', borderRadius: '3px', position: 'relative', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent)', width: `${j.completionPercentage}%`, borderRadius: '3px', transition: 'width 0.8s' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    <span>{j.completionPercentage?.toFixed(0)}% SYNCHRONIZED</span>
                    <span>{j.assignedTeams - j.evaluatedTeams} PENDING</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Submission Coverage
              <span className="badge" style={{ fontSize: '0.625rem' }}>{analytics.teamStats?.length || 0} Teams</span>
            </h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Identifier</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assignments</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Evaluations</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.teamStats || []).map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.teamName || `Team #${t.teamId}`}</p>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.assignedJudges}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: t.evaluationsReceived === t.assignedJudges ? 'var(--accent)' : 'inherit' }}>
                          {t.evaluationsReceived}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <span className={`badge ${t.evaluationsReceived === t.assignedJudges ? 'badge-success' : ''}`} style={{ fontSize: '0.625rem' }}>
                          {t.evaluationsReceived === t.assignedJudges ? 'FINALIZED' : t.evaluationsReceived > 0 ? 'PARTIAL' : 'NOT STARTED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : loading ? (
         <div className="card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
          <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Synchronizing Analytics...</h3>
        </div>
      ) : (
        <div className="card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.3 }}>📊</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Context Not Selected</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Please select a competition instance above to view evaluation metrics.</p>
        </div>
      )}
    </div>
  );
}
