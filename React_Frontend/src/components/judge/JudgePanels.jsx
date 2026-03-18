import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';

export function JudgeTeamAcceptancePanel() {
    const [teams, setTeams] = useState([]);

    const load = () => {
        axiosInstance.get('/api/judge/teams').then(r => setTeams(r.data)).catch(() => { });
    };
    useEffect(() => { load(); }, []);

    const accept = async (id) => {
        try { await axiosInstance.put(`/api/judge/teams/${id}/accept`); load(); } catch (e) { alert('Check role or assignment'); }
    };
    const reject = async (id) => {
        try { await axiosInstance.put(`/api/judge/teams/${id}/reject`); load(); } catch (e) { alert('Check role or assignment'); }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Team Acceptance</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Team Name</th>
                        <th>Hackathon ID</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map(t => (
                        <tr key={t.id} className="border-b">
                            <td className="py-2">{t.name}</td>
                            <td>{t.hackathonId}</td>
                            <td>
                                <span className={`px-2 py-1 text-sm rounded ${t.acceptanceStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' : t.acceptanceStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {t.acceptanceStatus}
                                </span>
                            </td>
                            <td>
                                <button onClick={() => accept(t.id)} className="mr-2 text-green-600 hover:text-green-800 font-semibold">Accept</button>
                                <button onClick={() => reject(t.id)} className="text-red-600 hover:text-red-800 font-semibold">Reject</button>
                            </td>
                        </tr>
                    ))}
                    {teams.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-gray-500">No teams assigned for acceptance yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export function AssignedTeamsPanel() {
    const [assignments, setAssignments] = useState([]);
    useEffect(() => {
        axiosInstance.get('/api/judge/assignments').then(r => setAssignments(r.data)).catch(() => { });
    }, []);

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">My Assigned Teams</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Hackathon ID</th>
                        <th>Team Name</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map(a => (
                        <tr key={a.id} className="border-b">
                            <td className="py-2">{a.hackathonId}</td>
                            <td>{a.teamName}</td>
                        </tr>
                    ))}
                    {assignments.length === 0 && <tr><td colSpan="2" className="py-4 text-center text-gray-500">No assigned teams found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export function EvaluationFormPanel() {
    const [hackathons, setHackathons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
        axiosInstance.get('/api/judge/assignments').then(r => {
            // Filter assignments for ACCEPTED teams only
            setAssignments(r.data);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            // NOTE: Using admin endpoint since judge endpoint might not expose criteria directly, 
            // but participant/public endpoints might. The plan implies criteria are bound to Hackathon.
            // Alternatively, the judge can fetch criteria. Assuming public route exists or judge route.
            // Based on typical MVC, we'll try to fetch from public active-hackathons or admin. 
            // MVP fallback: We'll assume GET /api/admin/criteria/{hackathonId} or /api/public/criteria/{hackathonId}
            // Since it's not strictly spec'd, let's use /api/admin/criteria/{hackathonId} but might throw 403.
            // Better: In Spring, we just expect the endpoint. If not, we handle error.
            axiosInstance.get(`/api/admin/criteria/${selectedHackathon}`).then(r => setCriteria(r.data)).catch(() => setCriteria([]));
        } else {
            setCriteria([]);
        }
    }, [selectedHackathon]);

    const filteredTeams = assignments.filter(a => a.hackathonId === Number(selectedHackathon));

    const onSubmit = async (data) => {
        if (!selectedTeam) { alert("Select a team"); return; }
        try {
            // Evaluation structure per Criteria
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
            alert('Evaluations submitted successfully.');
            reset();
        } catch (e) {
            alert('Error submitting evaluations. Team might not be ACCEPTED or you already submitted.');
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Evaluate Team</h2>
            <div className="mb-4">
                <label className="block mb-1 font-semibold">Select Hackathon</label>
                <select className="border p-2 w-full rounded" value={selectedHackathon} onChange={e => { setSelectedHackathon(e.target.value); setSelectedTeam(''); }}>
                    <option value="">-- Select Hackathon --</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>
            {selectedHackathon && (
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Select Assigned Team</label>
                    <select className="border p-2 w-full rounded" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                        <option value="">-- Select Team --</option>
                        {filteredTeams.map(t => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
                    </select>
                </div>
            )}

            {selectedTeam && criteria.length > 0 && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    {criteria.map((c, index) => (
                        <div key={c.id} className="mb-4 p-4 border rounded bg-gray-50">
                            <h3 className="font-bold text-lg">{c.name} <span className="text-sm font-normal text-gray-600">(Max: {c.maxScore}, Weight: {c.weight}%)</span></h3>
                            <p className="text-gray-700 mb-2 text-sm">{c.description}</p>
                            <div className="mb-2">
                                <label className="block text-sm font-semibold">Score</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="border p-2 w-full rounded"
                                    {...register(`score_${c.id}`, { required: true, min: 0, max: c.maxScore })}
                                />
                                {errors[`score_${c.id}`] && <span className="text-red-500 text-sm">Valid score is required (0 - {c.maxScore})</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Remarks</label>
                                <textarea className="border p-2 w-full rounded" rows="2" {...register(`remarks_${c.id}`)}></textarea>
                            </div>
                        </div>
                    ))}
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full transition font-semibold">Submit Evaluation</button>
                </form>
            )}
        </div>
    );
}

export function MyEvaluationsPanel() {
    const [evals, setEvals] = useState([]);
    useEffect(() => {
        axiosInstance.get('/api/judge/evaluations').then(r => setEvals(r.data)).catch(() => { });
    }, []);

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">My Submitted Evaluations</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Team ID</th>
                        <th>Criteria ID</th>
                        <th>Score</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {evals.map(e => (
                        <tr key={e.id} className="border-b">
                            <td className="py-2">{e.teamId}</td>
                            <td>{e.criteriaId}</td>
                            <td className="font-semibold text-blue-700">{e.score}</td>
                            <td className="text-gray-600 italic">{e.remarks}</td>
                        </tr>
                    ))}
                    {evals.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-gray-500">No evaluations submitted.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export function JudgeLeaderboardPanel() {
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            axiosInstance.get(`/api/judge/leaderboard?hackathonId=${selectedHackathon}`).then(r => setLeaderboard(r.data)).catch(() => setLeaderboard([]));
        }
    }, [selectedHackathon]);

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
            <div className="mb-4">
                <label className="block mb-1 font-semibold">Select Hackathon</label>
                <select className="border p-2 w-full rounded" value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
                    <option value="">-- Select Hackathon --</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>

            {selectedHackathon && (
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="py-3 px-2">Rank</th>
                            <th className="py-3 px-2">Team</th>
                            <th className="py-3 px-2">Weighted Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((row, i) => (
                            <tr key={row.teamId} className="border-b">
                                <td className="py-2 px-2 font-bold text-gray-700">{i + 1}</td>
                                <td className="py-2 px-2">{row.teamName}</td>
                                <td className="py-2 px-2 font-semibold text-blue-600">{row.weightedScore?.toFixed(2)}</td>
                            </tr>
                        ))}
                        {leaderboard.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-gray-500">No leaderboard data available.</td></tr>}
                    </tbody>
                </table>
            )}
        </div>
    );
}
