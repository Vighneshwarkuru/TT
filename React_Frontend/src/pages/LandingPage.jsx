import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function LandingPage() {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setHackathons(res.data);
                } else {
                    setHackathons([]);
                }
            })
            .catch(() => setHackathons([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, var(--bg-soft), white)', paddingBottom: '6rem' }}>
            <div className="container">
                <header style={{ padding: '120px 0 100px', textAlign: 'center', animation: 'fadeIn 0.8s ease-out' }}>
                    <div className="badge" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.25rem', letterSpacing: '0.1em', fontWeight: 800 }}>VERSION 4.0 RELEASED</div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1 }}>
                        Verdict<span style={{ color: 'var(--accent)' }}>Sphere</span>
                    </h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3.5rem', fontWeight: 500, lineHeight: 1.5 }}>
                        The definitive hackathon evaluation platform. Simple, clear, and efficient.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1rem', letterSpacing: '0.05em' }}>LOGIN</Link>
                        <Link to="/register" className="btn" style={{ padding: '1.25rem 3rem', fontSize: '1rem', letterSpacing: '0.05em', border: '1px solid var(--border)', background: 'white' }}>SIGN UP</Link>
                    </div>
                </header>

                <section style={{ animation: 'fadeIn 1s ease-out 0.2s both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Active Hackathons</h2>
                        <span className="badge" style={{ fontSize: '0.75rem' }}>{hackathons.length} HACKATHONS ONLINE</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                            <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>LOADING HACKATHONS...</p>
                        </div>
                    ) : Array.isArray(hackathons) && hackathons.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                            {hackathons.map(h => (
                                <div key={h.id} className="card" style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    height: '100%', 
                                    padding: '2.5rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default',
                                    background: 'white'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>{h.name}</h3>
                                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                                            {h.description || "Hackathon evaluation and project management platform."}
                                        </p>
                                    </div>
                                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--bg-soft)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <span>Start Date</span>
                                            <span style={{ color: 'var(--text-main)' }}>{h.startDate}</span>
                                        </div>
                                        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <span>End Date</span>
                                            <span style={{ color: 'var(--accent)' }}>{h.endDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', borderStyle: 'dashed', background: 'transparent' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600 }}>NO ACTIVE HACKATHONS FOUND</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Check back later for new events.</p>
                        </div>
                    )}
                </section>
            </div>
            
            <footer style={{ marginTop: '8rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>&copy; 2026 VERDICTSPHERE. FORGED FOR INNOVATION.</p>
            </footer>
        </div>
    );
}
