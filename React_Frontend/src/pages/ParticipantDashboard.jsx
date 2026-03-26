import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ParticipantDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons')
            .then(r => setHackathons(r.data))
            .catch(() => setHackathons([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div className="container">
                <header style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                        Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.firstName || 'Participant'}</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px' }}>
                        Join new challenges or continue your project. Your next great idea starts here.
                    </p>
                </header>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Available Hackathons</h3>
                    <span className="badge">{hackathons.length} Active</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>Loading hackathons...</p>
                    </div>
                ) : hackathons.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {hackathons.map(h => (
                            <div 
                                key={h.id}
                                onClick={() => navigate(`/hackathon/${h.id}`)}
                                className="card"
                                style={{ 
                                    cursor: 'pointer', 
                                    transition: 'transform 0.2s, border-color 0.2s', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{h.name}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '4.5em' }}>
                                        {h.description || "No description provided."}
                                    </p>
                                </div>
                                
                                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--bg-soft)', paddingTop: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span>Registration Deadline</span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{h.registrationDeadline}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span>Event Starts</span>
                                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{h.startDate}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)' }}>
                                        Register Now &rarr;
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', borderStyle: 'dashed', background: 'transparent' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>No active hackathons found at the moment.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Please check back later for new opportunities.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
