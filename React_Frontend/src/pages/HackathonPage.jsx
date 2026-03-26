import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';

export default function HackathonPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hackathon, setHackathon] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Registration form state
    const [formData, setFormData] = useState({
        teamName: '',
        projectTitle: '',
        abstractContent: '',
        extraQuestion1: '',
        extraQuestion2: '',
        extraQuestion3: ''
    });

    // Admin state for judge management
    const [assignedJudges, setAssignedJudges] = useState([]);
    const [allJudges, setAllJudges] = useState([]);
    const [showJudgeManager, setShowJudgeManager] = useState(false);
    const [activeManagementTab, setActiveManagementTab] = useState('GENERAL'); // GENERAL, TEAMS, LEADERBOARD, AUDIT
    const [teams, setTeams] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [hackathonAnalytics, setHackathonAnalytics] = useState(null);
    const [hackathonAuditLogs, setHackathonAuditLogs] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const hRes = await axiosInstance.get(`/api/public/hackathons/${id}`);
            setHackathon(hRes.data);

            if (user?.role === 'PARTICIPANT') {
                try {
                    const tRes = await axiosInstance.get(`/api/participant/team?hackathonId=${id}`);
                    setMyTeam(tRes.data);
                } catch (e) {
                    setMyTeam(null);
                }
            }

            if (user?.role === 'ADMIN') {
                fetchJudges();
                fetchAnalytics();
                fetchAuditLogs();
            }
        } catch (err) {
            setError("Failed to load hackathon details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axiosInstance.get(`/api/admin/analytics/${id}`);
            setHackathonAnalytics(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await axiosInstance.get(`/api/admin/audit-logs?entityType=HACKATHON&entityId=${id}&size=50`);
            setHackathonAuditLogs(res.data.content || []);
        } catch (e) { console.error(e); }
    };

    const fetchJudges = async () => {
        try {
            const [assigned, all] = await Promise.all([
                axiosInstance.get(`/api/admin/hackathons/${id}/judges`),
                axiosInstance.get('/api/admin/judges')
            ]);
            setAssignedJudges(assigned.data);
            setAllJudges(all.data);
        } catch (e) { console.error(e); }
    };

    const fetchTeams = async () => {
        try {
            const res = await axiosInstance.get(`/api/admin/teams/hackathon/${id}`);
            setTeams(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await axiosInstance.get(`/api/public/leaderboard/${id}`);
            setLeaderboard(res.data);
        } catch (e) { console.error(e); }
    };

    const handleAcceptTeam = async (teamId) => {
        try {
            await axiosInstance.put(`/api/admin/teams/${teamId}/accept`);
            fetchTeams();
        } catch (e) { alert("Failed to accept team"); }
    };

    const handleRejectTeam = async (teamId) => {
        try {
            await axiosInstance.put(`/api/admin/teams/${teamId}/reject`);
            fetchTeams();
        } catch (e) { alert("Failed to reject team"); }
    };

    const assignJudge = async (judgeId) => {
        try {
            await axiosInstance.post(`/api/admin/hackathons/${id}/judges/${judgeId}`);
            fetchJudges();
        } catch (e) { alert("Failed to assign judge"); }
    };

    const removeJudge = async (judgeId) => {
        try {
            await axiosInstance.delete(`/api/admin/hackathons/${id}/judges/${judgeId}`);
            fetchJudges();
        } catch (e) { alert("Failed to remove judge"); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axiosInstance.post('/api/participant/team', {
                ...formData,
                hackathonId: id
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)' }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
        </div>
    );

    if (error || !hackathon) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)' }}>
            <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Access Error</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || "Hackathon not found."}</p>
                <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ width: '100%' }}>Return to Dashboard</button>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.875rem' }}
                >
                    &larr; Back to Dashboard
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem', alignItems: 'start' }}>
                    <div className="main-content">
                        <header style={{ marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
                                {hackathon.name}
                            </h1>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
                                {hackathon.description}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <span className="badge" style={{ padding: '0.5rem 1rem' }}>
                                    📅 Deadline: {hackathon.registrationDeadline}
                                </span>
                                <span className="badge" style={{ padding: '0.5rem 1rem' }}>
                                    🏁 Starts: {hackathon.startDate}
                                </span>
                            </div>
                        </header>

                        <section style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                                <span style={{ width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '2px', marginRight: '1rem' }}></span>
                                Rules
                            </h2>
                            <div className="card" style={{ padding: '2rem', background: 'var(--bg-soft)' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.75rem', fontWeight: 900 }}>&check;</span>
                                        Max 4 members per team.
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.75rem', fontWeight: 900 }}>&check;</span>
                                        Projects must be built during the event timeframe.
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.75rem', fontWeight: 900 }}>&check;</span>
                                        Open-source projects only.
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    <aside className="sidebar">
                        {user?.role === 'PARTICIPANT' && !myTeam && (
                            <div className="card" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Team Registration</h2>
                                <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Team Name</label>
                                        <input 
                                            required
                                            value={formData.teamName}
                                            onChange={e => setFormData({...formData, teamName: e.target.value})}
                                            className="input"
                                            placeholder="The Matrix"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Project Title</label>
                                        <input 
                                            required
                                            value={formData.projectTitle}
                                            onChange={e => setFormData({...formData, projectTitle: e.target.value})}
                                            className="input"
                                            placeholder="Deep Learning for AI"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Abstract / Description</label>
                                        <textarea 
                                            required
                                            value={formData.abstractContent}
                                            onChange={e => setFormData({...formData, abstractContent: e.target.value})}
                                            className="input"
                                            style={{ minHeight: '100px' }}
                                            placeholder="Explain your project goals and tech stack..."
                                        />
                                    </div>

                                    {hackathon.extraQuestion1Label && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{hackathon.extraQuestion1Label}</label>
                                            <input 
                                                required
                                                value={formData.extraQuestion1}
                                                onChange={e => setFormData({...formData, extraQuestion1: e.target.value})}
                                                className="input"
                                            />
                                        </div>
                                    )}
                                    {hackathon.extraQuestion2Label && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{hackathon.extraQuestion2Label}</label>
                                            <input 
                                                required
                                                value={formData.extraQuestion2}
                                                onChange={e => setFormData({...formData, extraQuestion2: e.target.value})}
                                                className="input"
                                            />
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem', width: '100%' }}
                                    >
                                        {submitting ? 'Processing...' : 'Complete Registration'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {user?.role === 'PARTICIPANT' && myTeam && (
                            <div className="card" style={{ padding: '2rem', background: 'var(--bg-soft)', border: '1px solid var(--accent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>🚀</div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Team Registered</h2>
                                </div>
                                <div style={{ display: 'grid', gap: '1.25rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Team Name</p>
                                        <p style={{ fontWeight: 800, fontSize: '1.125rem' }}>{myTeam.teamName}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</p>
                                        <span className={`badge ${
                                            myTeam.status === 'ACCEPTED' ? 'badge-success' :
                                            myTeam.status === 'REJECTED' ? '' : // Use default for rejected for now
                                            ''
                                        }`}>
                                            {myTeam.status}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/participant')}
                                        className="btn"
                                        style={{ width: '100%', background: 'white', border: '1px solid var(--border)' }}
                                    >
                                        Manage Team Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {user?.role === 'ADMIN' && (
                             <div className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Manage Judges & Teams</h2>
                                    <button 
                                        onClick={() => setShowJudgeManager(!showJudgeManager)}
                                        style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        {showJudgeManager ? 'Panels' : 'Judges'}
                                    </button>
                                </div>
                                
                                {showJudgeManager ? (
                                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Assigned Judges</p>
                                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                {assignedJudges.map(j => (
                                                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.firstName} {j.lastName}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeJudge(j.id)}
                                                            style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', marginLeft: '0.5rem' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                                {assignedJudges.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No judges assigned.</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Available</p>
                                            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {allJudges.filter(j => !assignedJudges.find(aj => aj.id === j.id)).map(j => (
                                                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.firstName} {j.lastName}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => assignJudge(j.id)}
                                                            style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                            {['GENERAL', 'TEAMS', 'LEADERBOARD', 'AUDIT'].map(tab => (
                                                <button 
                                                    key={tab}
                                                    onClick={() => {
                                                        setActiveManagementTab(tab);
                                                        if (tab === 'TEAMS') fetchTeams();
                                                        if (tab === 'LEADERBOARD') fetchLeaderboard();
                                                    }}
                                                    style={{ 
                                                        padding: '0.75rem 0.5rem', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid var(--border)',
                                                        fontSize: '0.625rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        background: activeManagementTab === tab ? 'var(--accent)' : 'var(--bg-soft)',
                                                        color: activeManagementTab === tab ? 'white' : 'var(--text-muted)',
                                                        borderColor: activeManagementTab === tab ? 'var(--accent)' : 'var(--border)'
                                                    }}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                            {activeManagementTab === 'TEAMS' && (
                                                <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                    {teams.map(t => (
                                                        <div key={t.id} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                <p style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{t.teamName}</p>
                                                                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: t.acceptanceStatus === 'ACCEPTED' ? 'var(--accent)' : 'var(--text-muted)' }}>{t.acceptanceStatus}</span>
                                                            </div>
                                                            {t.acceptanceStatus === 'PENDING' && (
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                                    <button onClick={() => handleAcceptTeam(t.id)} className="btn btn-primary" style={{ padding: '0.25rem', fontSize: '0.625rem' }}>Accept</button>
                                                                    <button onClick={() => handleRejectTeam(t.id)} className="btn" style={{ padding: '0.25rem', fontSize: '0.625rem', border: '1px solid var(--border)' }}>Reject</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {teams.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No teams.</p>}
                                                </div>
                                            )}

                                            {activeManagementTab === 'LEADERBOARD' && (
                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    {leaderboard.slice(0, 8).map((entry, idx) => (
                                                        <div key={entry.teamId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}><span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{idx + 1}</span> {entry.teamName}</span>
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--accent)' }}>{entry.totalScore?.toFixed(1)}</span>
                                                        </div>
                                                    ))}
                                                    {leaderboard.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No scores.</p>}
                                                </div>
                                            )}

                                            {activeManagementTab === 'GENERAL' && (
                                                <div>
                                                    {hackathonAnalytics ? (
                                                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                                                            <div>
                                                                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Judge Progress</p>
                                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                                    {hackathonAnalytics.judgeStats.map(js => (
                                                                        <div key={js.judgeId}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                                                                <span>{js.judgeEmail.split('@')[0]}</span>
                                                                                <span>{js.evaluatedCount}/{js.totalAssigned}</span>
                                                                            </div>
                                                                            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                                <div style={{ height: '100%', background: 'var(--accent)', width: `${(js.evaluatedCount / js.totalAssigned) * 100}%` }}></div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {activeManagementTab === 'AUDIT' && (
                                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    {hackathonAuditLogs.map(log => (
                                                        <div key={log.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>{log.action}</p>
                                                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    ))}
                                                    {hackathonAuditLogs.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No logs.</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                        )}
                    </aside>
                </div>
            </div>
        </Layout>
    );
}
