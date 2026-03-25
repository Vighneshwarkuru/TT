import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';

export function JudgeTeamAcceptancePanel() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        axiosInstance.get('/api/judge/teams')
            .then(r => setTeams(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const accept = async (id) => {
        try { 
            await axiosInstance.put(`/api/judge/teams/${id}/accept`); 
            load(); 
        } catch (e) { 
            alert('Authorization error or assignment conflict.'); 
        }
    };
    const reject = async (id) => {
        try { 
            await axiosInstance.put(`/api/judge/teams/${id}/reject`); 
            load(); 
        } catch (e) { 
            alert('Authorization error or assignment conflict.'); 
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Team Intake</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review and acknowledge team assignments for the current evaluation cycle.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nominee</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Competition</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing assignments...</td></tr>
                        ) : teams.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending team assignments.</td></tr>
                        ) : teams.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>{t.teamName}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID: {t.hackathonId}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    <span className={`badge ${
                                        t.acceptanceStatus === 'ACCEPTED' ? 'badge-success' : 
                                        t.acceptanceStatus === 'REJECTED' ? '' : // Default variant
                                        'badge-accent' // PENDING
                                    }`} style={{ fontSize: '0.625rem' }}>
                                        {t.acceptanceStatus}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    {t.acceptanceStatus === 'PENDING' ? (
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => accept(t.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.625rem', borderRadius: '4px' }}>ACCEPT</button>
                                            <button onClick={() => reject(t.id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.625rem', borderRadius: '4px', background: 'none', border: '1px solid var(--border)' }}>REJECT</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acknowledged</span>
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

export function AssignedTeamsPanel() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/api/judge/assignments')
            .then(r => setAssignments(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Evaluation Portfolio</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Registry of all teams currently under your judicial oversight.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Competition Reference</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nominee Identity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="2" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading registry...</td></tr>
                        ) : assignments.length === 0 ? (
                            <tr><td colSpan="2" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No teams currently in portfolio.</td></tr>
                        ) : assignments.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}># {a.hackathonId}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 800, fontSize: '0.9375rem' }}>{a.teamName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function EvaluationFormPanel() {
    const [hackathons, setHackathons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
        axiosInstance.get('/api/judge/assignments').then(r => setAssignments(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            axiosInstance.get(`/api/public/criteria/${selectedHackathon}`).then(r => setCriteria(r.data)).catch(() => setCriteria([]));
        } else {
            setCriteria([]);
        }
    }, [selectedHackathon]);

    const filteredTeams = assignments.filter(a => a.hackathonId === Number(selectedHackathon));

    const onSubmit = async (data) => {
        if (!selectedTeam) { alert("Please select a target nominee."); return; }
        setIsSubmitting(true);
        try {
            const promises = criteria.map(c => {
                const payload = {
                    teamId: Number(selectedTeam),
                    criteriaId: c.id,
                    score: Number(data[`score_${c.id}`]),
                    remarks: data[`remarks_${c.id}`]
                };
                return axiosInstance.post('/api/judge/evaluations', payload);
            });
            await Promise.all(promises);
            alert('Evaluation synchronized successfully.');
            reset();
            setSelectedTeam('');
        } catch (e) {
            alert('Synchronization failed. Verify nominee acceptance status or duplicate submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Judicial Review</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Submit quantitative scores and qualitative feedback based on set criteria.</p>
            </header>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Competition</label>
                        <select className="input" style={{ background: 'white' }} value={selectedHackathon} onChange={e => { setSelectedHackathon(e.target.value); setSelectedTeam(''); }}>
                            <option value="">Select competition...</option>
                            {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    {selectedHackathon && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Target Nominee</label>
                            <select className="input" style={{ background: 'white' }} value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                                <option value="">Select nominee...</option>
                                {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {selectedTeam && criteria.length > 0 ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                        {criteria.map((c) => (
                            <div key={c.id} className="card" style={{ padding: '1.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{c.name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '500px' }}>{c.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge" style={{ fontSize: '0.625rem' }}>Max: {c.maxScore}</span>
                                        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase' }}>Weight: {c.weight}%</div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Score</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input"
                                            placeholder="0.00"
                                            {...register(`score_${c.id}`, { required: true, min: 0, max: c.maxScore })}
                                            style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.125rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Observations</label>
                                        <textarea className="input" style={{ minHeight: '44px' }} placeholder="Provide justification for this score..." {...register(`remarks_${c.id}`)}></textarea>
                                    </div>
                                </div>
                                {errors[`score_${c.id}`] && <p style={{ color: 'var(--error)', fontSize: '0.625rem', fontWeight: 700, marginTop: '0.5rem', textTransform: 'uppercase' }}>Precision Error: Score must be between 0 and {c.maxScore}.</p>}
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                        {isSubmitting ? 'SYNCHRONIZING...' : 'FINALIZE EVALUATION'}
                    </button>
                </form>
            ) : selectedTeam ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Framework mismatch: No criteria defined for this competition.</p>
                </div>
            ) : null}
        </div>
    );
}

export function MyEvaluationsPanel() {
    const [evals, setEvals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/api/judge/evaluations')
            .then(r => setEvals(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Submission History</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Log of all successfully synchronized evaluations submitted to the ledger.</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nominee</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Metric ID</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Precision Score</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Observations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Synchronizing audit...</td></tr>
                        ) : evals.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No submissions on record.</td></tr>
                        ) : evals.map(e => (
                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Team #{e.teamId}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID {e.criteriaId}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>{e.score}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '300px', marginLeft: 'auto' }}>{e.remarks || 'No qualitative data.'}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function JudgeLeaderboardPanel() {
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            setLoading(true);
            axiosInstance.get(`/api/judge/leaderboard?hackathonId=${selectedHackathon}`)
                .then(r => setLeaderboard(r.data))
                .catch(() => setLeaderboard([]))
                .finally(() => setLoading(false));
        }
    }, [selectedHackathon]);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Live Rankings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Real-time synthesis of all evaluations mapped to current standing.</p>
            </header>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-soft)', border: 'none' }}>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Inquiry Context</label>
                <select className="input" style={{ background: 'white', maxWidth: '400px' }} value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
                    <option value="">Select competition...</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>

            {selectedHackathon ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Standing</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nominee</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Composite Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Calculating standings...</td></tr>
                            ) : leaderboard.length === 0 ? (
                                <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Insufficient data for ranking.</td></tr>
                            ) : leaderboard.map((row, i) => (
                                <tr key={row.teamId} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--bg-soft)', color: i === 0 ? 'white' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{i + 1}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>{row.teamName}</td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>{row.weightedScore?.toFixed(2)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-soft)', border: '1px dashed var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Please select a context above to view the leaderboard.</p>
                </div>
            )}
        </div>
    );
}
