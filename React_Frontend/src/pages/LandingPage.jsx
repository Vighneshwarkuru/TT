import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 },
  hero: { textAlign: 'center', padding: '48px 0 32px' },
  heroTitle: { fontSize: 48, fontWeight: 700, color: '#1976d2', margin: 0 },
  heroSub: { fontSize: 18, color: '#555', marginTop: 12 },
  nav: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 },
  btn: { padding: '10px 24px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 15 },
  btnPrimary: { background: '#1976d2', color: '#fff', border: 'none' },
  btnOutline: { background: '#fff', color: '#1976d2', border: '2px solid #1976d2' },
  section: { marginTop: 48 },
  sectionTitle: { fontSize: 24, fontWeight: 600, color: '#333', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card: { border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: '#1976d2', marginBottom: 8 },
  cardDate: { fontSize: 13, color: '#777' },
  empty: { color: '#999', fontStyle: 'italic' },
};

export default function LandingPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/public/active-hackathons')
      .then(res => {
        if (Array.isArray(res.data)) {
          setHackathons(res.data);
        } else {
          console.error('Expected array for hackathons, got:', res.data);
          setHackathons([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch hackathons:', err);
        setHackathons([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>VerdictSphere</h1>
        <p style={styles.heroSub}>The hackathon evaluation platform for teams, judges, and organizers.</p>
        <div style={styles.nav}>
          <Link to="/login" style={{ ...styles.btn, ...styles.btnPrimary }}>Login</Link>
          <Link to="/register" style={{ ...styles.btn, ...styles.btnOutline }}>Register</Link>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Hackathons</h2>
        {loading ? (
          <p>Loading...</p>
        ) : Array.isArray(hackathons) && hackathons.length > 0 ? (
          <div style={styles.grid}>
            {hackathons.map(h => (
              <div key={h.id} style={styles.card}>
                <div style={styles.cardTitle}>{h.name}</div>
                {h.description && <p style={{ fontSize: 14, color: '#555', margin: '4px 0 8px' }}>{h.description}</p>}
                <div style={styles.cardDate}>Start: {h.startDate}</div>
                <div style={styles.cardDate}>End: {h.endDate}</div>
                {h.registrationDeadline && (
                  <div style={styles.cardDate}>Registration deadline: {h.registrationDeadline}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>No active hackathons at the moment.</p>
        )}
      </div>
    </div>
  );
}
