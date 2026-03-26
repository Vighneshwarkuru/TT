import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

export function TeamBrowserPanel({ hackathons = [] }) {
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get('/api/participant/team').then(r => setMyTeam(r.data)).catch(() => setMyTeam(null));
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            setLoading(true);
            axiosInstance.get(`/api/public/teams/${selectedHackathon}`)
                .then(r => setTeams(r.data))
                .catch(() => setTeams([]))
                .finally(() => setLoading(false));
        }
    }, [selectedHackathon]);

    const requestJoin = async (teamId) => {
        try {
            await axiosInstance.post('/api/participant/team/join', { teamId });
            alert('Request sent successfully!');
        } catch (e) {
            alert(e.response?.data?.message || 'Error occurred. You may have a pending request or active membership.');
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Browse Teams</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Find and join a team for a hackathon.</p>
            </header>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none' }}>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Select Hackathon</label>
                <select className="input" style={{ background: 'white', maxWidth: '400px' }} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
                    <option value="">Select hackathon...</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>

            {selectedHackathon ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <div className="card col-span-full" style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading teams...</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="card col-span-full" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border)', background: 'var(--bg-soft)' }}>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No teams found for this hackathon yet.</p>
                        </div>
                    ) : teams.map(t => (
                        <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem', transition: 'transform 0.2s ease', cursor: 'default' }}
                             onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent)' }}>{t.teamName}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Team ID: #{t.id}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ flex: 1, height: '4px', background: 'var(--bg-soft)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(t.memberCount / (t.maxCapacity || 4)) * 100}%`, background: 'var(--accent)' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)' }}>{t.memberCount}/{t.maxCapacity || 4} MEMBERS</span>
                                </div>
                            </div>
                            <button
                                onClick={() => requestJoin(t.id)}
                                disabled={myTeam !== null || t.memberCount >= (t.maxCapacity || 4)}
                                className="btn btn-primary"
                                style={{ width: '100%', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                            >
                                {t.memberCount >= (t.maxCapacity || 4) ? 'TEAM FULL' : myTeam ? 'ALREADY IN A TEAM' : 'REQUEST TO JOIN'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function JoinRequestsPanel() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        axiosInstance.get('/api/participant/team/join-requests')
            .then(r => setRequests(r.data))
            .catch(() => setRequests([]))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const accept = async (id) => {
        try { await axiosInstance.put(`/api/participant/team/join-requests/${id}/accept`); load(); } catch (e) { alert('Error accepting request.'); }
    };
    const reject = async (id) => {
        try { await axiosInstance.put(`/api/participant/team/join-requests/${id}/reject`); load(); } catch (e) { alert('Error rejecting request.'); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Join Requests</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage requests from users wanting to join your team.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading requests...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending requests.</td></tr>
                        ) : requests.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <p style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{r.requesterFirstName} {r.requesterLastName}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.requesterEmail}</p>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span className={`badge ${r.status === 'ACCEPTED' ? 'badge-success' : r.status === 'PENDING' ? 'badge-accent' : ''}`} style={{ fontSize: '0.625rem' }}>
                                        {r.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    {r.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => accept(r.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.625rem', borderRadius: '4px' }}>APPROVE</button>
                                            <button onClick={() => reject(r.id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.625rem', borderRadius: '4px', background: 'none', border: '1px solid var(--border)' }}>DECLINE</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TeamProfilePanel({ hackathons = [] }) {
    const [myTeam, setMyTeam] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const { register, handleSubmit } = useForm();
    const { user } = useAuth();

    const load = () => {
        axiosInstance.get('/api/participant/team')
            .then(r => setMyTeam(r.data))
            .catch(() => setMyTeam(null));
    };

    useEffect(() => { load(); }, []);

    const createTeam = async (data) => {
        setIsCreating(true);
        try {
            await axiosInstance.post('/api/participant/team', data);
            alert('Team created successfully.');
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Error occurred. Name may be taken or you already have a team.');
        } finally {
            setIsCreating(false);
        }
    };

    if (myTeam) {
        return (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>My Team</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Details about your current hackathon team.</p>
                </header>

                <div className="card" style={{ padding: '2rem', background: 'var(--bg-soft)', border: 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Team Name</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{myTeam.teamName}</h3>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Hackathon</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700 }}>Identifier #{myTeam.hackathonId}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Status</p>
                            <span className={`badge ${myTeam.acceptanceStatus === 'ACCEPTED' ? 'badge-success' : myTeam.acceptanceStatus === 'REJECTED' ? 'badge-error' : 'badge-accent'}`} style={{ fontSize: '0.625rem' }}>
                                {myTeam.acceptanceStatus}
                            </span>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Team Lead</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{myTeam.createdBy?.id === user?.id ? 'Team Lead (You)' : (myTeam.createdBy?.email || 'Team Lead')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '600px' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Create Team</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create a new team to participate in a hackathon.</p>
            </header>

            <form onSubmit={handleSubmit(createTeam)} className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Competition</label>
                    <select className="input" {...register('hackathonId', { required: true })}>
                        <option value="">Select hackathon...</option>
                        {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Team Name</label>
                    <input className="input" placeholder="Enter your team name..." {...register('teamName', { required: true })} />
                </div>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                    {isCreating ? 'CREATING...' : 'CREATE TEAM'}
                </button>
            </form>
        </div>
    );
}

export function TeamMembersPanel() {
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const load = () => {
        setLoading(true);
        axiosInstance.get('/api/participant/team')
            .then(r => setMyTeam(r.data))
            .catch(() => setMyTeam(null))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const removeMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await axiosInstance.delete(`/api/participant/team/members/${userId}`);
            load();
        } catch (e) {
            alert('Failed to remove member.');
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Loading members...</div>;
    if (!myTeam) return <div className="card" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border)', background: 'var(--bg-soft)' }}><p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>You are not in a team yet.</p></div>;

    const isLead = myTeam.createdBy?.id === user?.id;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Team Members ({myTeam.members?.length || 0})</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Users currently in your team.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {myTeam.members?.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>{m.email}</p>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.025em' }}>Registered: {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Historical'}</p>
                                </td>
                                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                    {isLead && m.userId !== user?.id && (
                                        <button
                                            onClick={() => removeMember(m.userId)}
                                            className="btn"
                                            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--error)', fontSize: '0.625rem', fontWeight: 800, padding: '0.5rem 1rem' }}
                                        >
                                            REMOVE MEMBER
                                        </button>
                                    )}
                                    {m.id === myTeam.createdBy?.id && <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>TEAM LEAD</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ProjectSubmissionPanel() {
    const [myTeam, setMyTeam] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        axiosInstance.get('/api/participant/team').then(r => {
            setMyTeam(r.data);
            reset({
                githubUrl: r.data.githubUrl || '',
                demoUrl: r.data.demoUrl || '',
                presentationUrl: r.data.presentationUrl || ''
            });
        }).catch(() => { });
    }, [reset]);

    const submitUrls = async (data) => {
        setIsSaving(true);
        try {
            await axiosInstance.put('/api/participant/team/submission', data);
            alert('Project submitted successfully.');
        } catch (e) {
            alert(e.response?.data?.message || 'Error occurred. Please verify link format.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!myTeam.id) return <div className="card" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border)', background: 'var(--bg-soft)' }}><p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No active team found. Submission disabled.</p></div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '800px' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Submit Project</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Submit your project links for evaluation.</p>
            </header>

            <form onSubmit={handleSubmit(submitUrls)} className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>GitHub Link</label>
                        <input type="url" className="input" placeholder="https://github.com/user/project" {...register('githubUrl')} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Demo Link</label>
                        <input type="url" className="input" placeholder="https://project.demo.com" {...register('demoUrl')} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Presentation Link</label>
                        <input type="url" className="input" placeholder="https://presentation.com/pitch" {...register('presentationUrl')} />
                    </div>
                </div>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '2.5rem', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                    {isSaving ? 'SAVING...' : 'SUBMIT PROJECT'}
                </button>
            </form>
        </div>
    );
}

export function MyScoresPanel() {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/api/participant/scores')
            .then(r => setScores(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>My Scores</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>View scores and feedback from judges.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Criteria</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Judge Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading scores...</td></tr>
                        ) : scores.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No evaluations on record yet.</td></tr>
                        ) : scores.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID {s.criteriaId}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>{s.score}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '300px', marginLeft: 'auto' }}>{s.remarks || 'No qualitative data.'}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ParticipantLeaderboardPanel() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/api/participant/leaderboard')
            .then(r => setLeaderboard(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Leaderboard</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current standings for your hackathon.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rank</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Team</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading standings...</td></tr>
                        ) : leaderboard.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No ranking data available.</td></tr>
                        ) : leaderboard.map((row, index) => (
                            <tr key={row.teamId} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: index === 0 ? 'var(--accent)' : 'var(--bg-soft)', color: index === 0 ? 'white' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{index + 1}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, fontSize: '1rem', color: index === 0 ? 'var(--accent)' : 'var(--text)' }}>{row.teamName}</td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>{row.weightedScore?.toFixed(2)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
