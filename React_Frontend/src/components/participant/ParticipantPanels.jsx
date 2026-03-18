import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

export function TeamBrowserPanel() {
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
        axiosInstance.get('/api/participant/team').then(r => setMyTeam(r.data)).catch(() => setMyTeam(null));
    }, []);

    useEffect(() => {
        if (selectedHackathon) {
            axiosInstance.get(`/api/public/teams/${selectedHackathon}`).then(r => setTeams(r.data)).catch(() => setTeams([]));
        }
    }, [selectedHackathon]);

    const requestJoin = async (teamId) => {
        try {
            await axiosInstance.post(`/api/participant/team/join?teamId=${teamId}`);
            alert('Join request sent!');
        } catch (e) {
            alert(e.response?.data?.message || 'Error sending join request. You might already have a pending request or be on a team.');
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Browse Teams</h2>
            <div className="mb-4">
                <label className="block mb-1 font-semibold">Select Hackathon</label>
                <select className="border p-2 w-full rounded" value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}>
                    <option value="">-- Select Hackathon --</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>

            {selectedHackathon && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map(t => (
                        <div key={t.id} className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-indigo-700">{t.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">Team ID: {t.id}</p>
                                <p className="text-sm font-semibold mb-4">Members: {t.memberCount}/{t.maxCapacity || 4}</p>
                            </div>
                            <button
                                onClick={() => requestJoin(t.id)}
                                disabled={myTeam !== null || t.memberCount >= (t.maxCapacity || 4)}
                                className="bg-indigo-600 text-white py-2 rounded font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                            >
                                {t.memberCount >= (t.maxCapacity || 4) ? 'Team Full' : myTeam ? 'Already on a Team' : 'Request to Join'}
                            </button>
                        </div>
                    ))}
                    {teams.length === 0 && <p className="text-gray-500 col-span-full">No teams created yet.</p>}
                </div>
            )}
        </div>
    );
}

export function JoinRequestsPanel() {
    const [requests, setRequests] = useState([]);

    const load = () => {
        axiosInstance.get('/api/participant/team/join-requests').then(r => setRequests(r.data)).catch(() => setRequests([]));
    };
    useEffect(() => { load(); }, []);

    const accept = async (id) => {
        try { await axiosInstance.put(`/api/participant/team/join-requests/${id}/accept`); load(); } catch (e) { alert('Error accepting request'); }
    };
    const reject = async (id) => {
        try { await axiosInstance.put(`/api/participant/team/join-requests/${id}/reject`); load(); } catch (e) { alert('Error rejecting request'); }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Join Requests</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">User Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(r => (
                        <tr key={r.id} className="border-b">
                            <td className="py-2">{r.userFirstName} {r.userLastName}</td>
                            <td>{r.userEmail}</td>
                            <td>
                                <span className={`px-2 py-1 text-xs rounded ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : r.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {r.status}
                                </span>
                            </td>
                            <td>
                                {r.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => accept(r.id)} className="mr-2 text-green-600 font-semibold hover:text-green-800">Accept</button>
                                        <button onClick={() => reject(r.id)} className="text-red-600 font-semibold hover:text-red-800">Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {requests.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-gray-500">No pending join requests.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export function TeamProfilePanel() {
    const [myTeam, setMyTeam] = useState(null);
    const [hackathons, setHackathons] = useState([]);
    const { register, handleSubmit } = useForm();
    const { user } = useAuth();

    const load = () => {
        axiosInstance.get('/api/participant/team').then(r => setMyTeam(r.data)).catch(() => setMyTeam(null));
    };

    useEffect(() => {
        load();
        axiosInstance.get('/api/public/active-hackathons').then(r => setHackathons(r.data)).catch(() => { });
    }, []);

    const createTeam = async (data) => {
        try {
            await axiosInstance.post('/api/participant/team', data);
            alert('Team created successfully!');
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Error creating team.');
        }
    };

    if (myTeam) {
        return (
            <div className="p-6 bg-white shadow rounded border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">{myTeam.name}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-sm text-gray-500 font-semibold">Hackathon ID</p><p className="text-lg">{myTeam.hackathonId}</p></div>
                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Status</p>
                        <span className={`px-2 py-1 text-sm rounded inline-block mt-1 ${myTeam.acceptanceStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' : myTeam.acceptanceStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {myTeam.acceptanceStatus}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500 font-semibold">Team Created By</p>
                        <p className="text-md">{myTeam.creatorId === user?.id ? 'You (Team Lead)' : `User ID: ${myTeam.creatorId}`}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white shadow rounded max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create a Team</h2>
            <form onSubmit={handleSubmit(createTeam)}>
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Hackathon</label>
                    <select className="border p-2 w-full rounded" {...register('hackathonId', { required: true })}>
                        <option value="">-- Select Hackathon --</option>
                        {hackathons.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Team Name</label>
                    <input className="border p-2 w-full rounded" {...register('name', { required: true })} />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 w-full rounded hover:bg-indigo-700 font-semibold transition">
                    Create Team
                </button>
            </form>
        </div>
    );
}

export function TeamMembersPanel() {
    const [myTeam, setMyTeam] = useState(null);
    const { user } = useAuth();

    const load = () => {
        axiosInstance.get('/api/participant/team').then(r => setMyTeam(r.data)).catch(() => setMyTeam(null));
    };
    useEffect(() => { load(); }, []);

    const removeMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await axiosInstance.delete(`/api/participant/team/members/${userId}`);
            load();
        } catch (e) {
            alert('Error removing member.');
        }
    };

    if (!myTeam) return <div className="p-4 text-gray-500 italic bg-white rounded shadow">You are not on a team yet.</div>;

    const isLead = myTeam.creatorId === user?.id;

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Team Members ({myTeam.members?.length || 0})</h2>
            <ul className="divide-y border border-gray-200 rounded">
                {myTeam.members?.map(m => (
                    <li key={m.id} className="py-3 px-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                            <span className="font-semibold block">{m.userEmail}</span>
                            <span className="text-sm text-gray-500">Joined: {new Date(m.joinedAt).toLocaleDateString()}</span>
                        </div>
                        {isLead && m.userId !== user?.id && (
                            <button
                                onClick={() => removeMember(m.userId)}
                                className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                            >
                                Remove
                            </button>
                        )}
                        {m.userId === myTeam.creatorId && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded border border-indigo-200 font-semibold">Team Lead</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function ProjectSubmissionPanel() {
    const [myTeam, setMyTeam] = useState({});
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
        try {
            await axiosInstance.put('/api/participant/team/submission', data);
            alert('URLs successfully submitted!');
        } catch (e) {
            alert(e.response?.data?.message || 'Error saving URLs. Must include valid https:// links.');
        }
    };

    if (!myTeam.id) return <div className="p-4 text-gray-500 italic bg-white shadow rounded">You are not on a team yet.</div>;

    return (
        <div className="p-4 bg-white shadow rounded max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Project Submission Links</h2>
            <form onSubmit={handleSubmit(submitUrls)} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-gray-700">GitHub URL</label>
                    <input type="url" className="border p-2 w-full rounded focus:ring focus:border-indigo-300" placeholder="https://github.com/..." {...register('githubUrl')} />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-gray-700">Live Demo URL</label>
                    <input type="url" className="border p-2 w-full rounded focus:ring focus:border-indigo-300" placeholder="https://..." {...register('demoUrl')} />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-gray-700">Presentation URL</label>
                    <input type="url" className="border p-2 w-full rounded focus:ring focus:border-indigo-300" placeholder="https://docs.google.com/..." {...register('presentationUrl')} />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-semibold transition mt-2">
                    Save Links
                </button>
            </form>
        </div>
    );
}

export function MyScoresPanel() {
    const [scores, setScores] = useState([]);
    useEffect(() => {
        axiosInstance.get('/api/participant/scores').then(r => setScores(r.data)).catch(() => { });
    }, []);

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">My Team's Evaluations</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Criteria ID</th>
                        <th>Score</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map(s => (
                        <tr key={s.id} className="border-b">
                            <td className="py-2">{s.criteriaId}</td>
                            <td className="font-semibold text-indigo-700">{s.score}</td>
                            <td className="text-gray-600 italic">{s.remarks}</td>
                        </tr>
                    ))}
                    {scores.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-gray-500">No scores available yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export function ParticipantLeaderboardPanel() {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        axiosInstance.get('/api/participant/leaderboard').then(r => setLeaderboard(r.data)).catch(() => { });
    }, []);

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Overall Leaderboard</h2>
            <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="py-3 px-2">Rank</th>
                        <th className="py-3 px-2">Team</th>
                        <th className="py-3 px-2 text-right">Weighted Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((row, index) => (
                        <tr key={row.teamId} className="border-b">
                            <td className="py-2 px-2 font-bold text-gray-700">{index + 1}</td>
                            <td className="py-2 px-2">{row.teamName}</td>
                            <td className="py-2 px-2 font-bold text-indigo-700 text-right">{row.weightedScore?.toFixed(2)}</td>
                        </tr>
                    ))}
                    {leaderboard.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-gray-500">Leaderboard is empty.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
