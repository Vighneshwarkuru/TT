import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error || !hackathon) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
                <p className="text-slate-300 mb-6">{error || "Hackathon not found."}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 pb-20 pt-16 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="mb-8 flex items-center text-slate-400 hover:text-white transition group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                    </button>
                    
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {hackathon.name}
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-xl">
                                {hackathon.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm font-medium">
                                <div className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-md">
                                    📅 Deadline: {hackathon.registrationDeadline}
                                </div>
                                <div className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-md">
                                    🏁 Starts: {hackathon.startDate}
                                </div>
                            </div>
                        </div>

                        {user?.role === 'PARTICIPANT' && !myTeam && (
                            <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-700">
                                <h2 className="text-2xl font-bold mb-6">Register Your Team</h2>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400">Team Name</label>
                                        <input 
                                            required
                                            value={formData.teamName}
                                            onChange={e => setFormData({...formData, teamName: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            placeholder="The Matrix"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400">Project Title</label>
                                        <input 
                                            required
                                            value={formData.projectTitle}
                                            onChange={e => setFormData({...formData, projectTitle: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            placeholder="Deep Learning for AI"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400">Abstract / Description</label>
                                        <textarea 
                                            required
                                            value={formData.abstractContent}
                                            onChange={e => setFormData({...formData, abstractContent: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[100px]"
                                            placeholder="Explain your project goals and tech stack..."
                                        />
                                    </div>

                                    {hackathon.extraQuestion1Label && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400">{hackathon.extraQuestion1Label}</label>
                                            <input 
                                                required
                                                value={formData.extraQuestion1}
                                                onChange={e => setFormData({...formData, extraQuestion1: e.target.value})}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            />
                                        </div>
                                    )}
                                    {hackathon.extraQuestion2Label && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400">{hackathon.extraQuestion2Label}</label>
                                            <input 
                                                required
                                                value={formData.extraQuestion2}
                                                onChange={e => setFormData({...formData, extraQuestion2: e.target.value})}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                            />
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Registering...' : 'Complete Registration'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {user?.role === 'PARTICIPANT' && myTeam && (
                            <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-3xl shadow-xl animate-in zoom-in duration-500">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg">🚀</div>
                                    <h2 className="text-2xl font-bold">You're Registered!</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-300 mb-1 uppercase tracking-wider">Team Name</p>
                                        <p className="text-xl font-bold">{myTeam.teamName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-300 mb-1 uppercase tracking-wider">Status</p>
                                        <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                                            myTeam.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            myTeam.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {myTeam.status}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/participant')}
                                        className="w-full mt-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition"
                                    >
                                        Manage Team Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {user?.role === 'ADMIN' && (
                             <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h2 className="text-2xl font-bold mb-6 flex justify-between items-center">
                                    Governance Center
                                    <button 
                                        onClick={() => setShowJudgeManager(!showJudgeManager)}
                                        className="text-sm px-4 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition"
                                    >
                                        {showJudgeManager ? 'Hide Management' : 'Manage Judges'}
                                    </button>
                                </h2>
                                
                                {showJudgeManager ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <h3 className="text-[10px] font-black p-2 bg-indigo-500/10 text-indigo-400 rounded-lg inline-block uppercase tracking-widest mb-4">Assigned Judges</h3>
                                            <div className="space-y-2">
                                                {assignedJudges.map(j => (
                                                    <div key={j.id} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-white/5 group">
                                                        <div>
                                                            <p className="font-bold">{j.firstName} {j.lastName}</p>
                                                            <p className="text-xs text-slate-500">{j.email}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeJudge(j.id)}
                                                            className="text-xs font-bold text-rose-500 hover:bg-rose-500/10 px-3 py-1 rounded-lg transition"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                                {assignedJudges.length === 0 && <p className="text-slate-600 text-sm italic">No judges assigned yet.</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black p-2 bg-slate-500/10 text-slate-400 rounded-lg inline-block uppercase tracking-widest mb-4">Available Judges</h3>
                                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {allJudges.filter(j => !assignedJudges.find(aj => aj.id === j.id)).map(j => (
                                                    <div key={j.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition">
                                                        <div>
                                                            <p className="font-bold">{j.firstName} {j.lastName}</p>
                                                            <p className="text-xs text-slate-500">{j.email}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => assignJudge(j.id)}
                                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => { setActiveManagementTab('TEAMS'); fetchTeams(); }}
                                                className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 ${activeManagementTab === 'TEAMS' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900/50 hover:bg-slate-900 border-slate-700'}`}
                                            >
                                                <span className="text-2xl">👥</span>
                                                <span className="text-sm font-semibold">View Teams</span>
                                            </button>
                                            <button 
                                                onClick={() => { setActiveManagementTab('LEADERBOARD'); fetchLeaderboard(); }}
                                                className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 ${activeManagementTab === 'LEADERBOARD' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900/50 hover:bg-slate-900 border-slate-700'}`}
                                            >
                                                <span className="text-2xl">📊</span>
                                                <span className="text-sm font-semibold">Leaderboard</span>
                                            </button>
                                            <button 
                                                onClick={() => setActiveManagementTab('GENERAL')}
                                                className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 ${activeManagementTab === 'GENERAL' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900/50 hover:bg-slate-900 border-slate-700'}`}
                                            >
                                                <span className="text-2xl">⚙️</span>
                                                <span className="text-sm font-semibold">General</span>
                                            </button>
                                            <button 
                                                onClick={() => setActiveManagementTab('AUDIT')}
                                                className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 ${activeManagementTab === 'AUDIT' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900/50 hover:bg-slate-900 border-slate-700'}`}
                                            >
                                                <span className="text-2xl">📜</span>
                                                <span className="text-sm font-semibold">Audit Logs</span>
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="mt-6 border-t border-white/5 pt-6">
                                            {activeManagementTab === 'TEAMS' && (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Registered Teams</h3>
                                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {teams.map(t => (
                                                            <div key={t.id} className="p-4 bg-slate-900/80 rounded-2xl border border-white/5">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="font-bold text-lg">{t.teamName}</p>
                                                                        <p className="text-xs text-indigo-400">{t.projectTitle}</p>
                                                                    </div>
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                        t.acceptanceStatus === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                        t.acceptanceStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                                                                        'bg-amber-500/20 text-amber-400'
                                                                    }`}>
                                                                        {t.acceptanceStatus}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-2 mt-4">
                                                                    {t.acceptanceStatus === 'PENDING' && (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleAcceptTeam(t.id)}
                                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded-lg text-xs font-bold transition"
                                                                            >
                                                                                Accept
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleRejectTeam(t.id)}
                                                                                className="flex-1 bg-rose-600 hover:bg-rose-500 py-1.5 rounded-lg text-xs font-bold transition"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {teams.length === 0 && <p className="text-slate-600 text-sm italic py-4">No teams found.</p>}
                                                    </div>
                                                </div>
                                            )}

                                            {activeManagementTab === 'LEADERBOARD' && (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Current Standings</h3>
                                                    <div className="space-y-2">
                                                        {leaderboard.slice(0, 5).map((entry, idx) => (
                                                            <div key={entry.teamId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800'}`}>
                                                                        {idx + 1}
                                                                    </span>
                                                                    <p className="font-semibold text-sm">{entry.teamName}</p>
                                                                </div>
                                                                <p className="font-mono text-indigo-400 font-bold">{entry.totalScore?.toFixed(1) || '0.0'}</p>
                                                            </div>
                                                        ))}
                                                        {leaderboard.length === 0 && <p className="text-slate-600 text-sm italic py-4 text-center">No scores recorded yet.</p>}
                                                    </div>
                                                </div>
                                            )}

                                            {activeManagementTab === 'GENERAL' && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Evaluation Coverage</h3>
                                                    {hackathonAnalytics ? (
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-1 gap-4">
                                                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                                    <p className="text-xs text-slate-500 mb-2 uppercase font-bold">Judge Progress</p>
                                                                    <div className="space-y-4">
                                                                        {hackathonAnalytics.judgeStats.map(js => (
                                                                            <div key={js.judgeId} className="space-y-1">
                                                                                <div className="flex justify-between text-[11px]">
                                                                                    <span>{js.judgeEmail}</span>
                                                                                    <span className="font-mono">{js.evaluatedCount}/{js.totalAssigned}</span>
                                                                                </div>
                                                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className="h-full bg-indigo-500 transition-all duration-1000" 
                                                                                        style={{ width: `${(js.evaluatedCount / js.totalAssigned) * 100}%` }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                                    <p className="text-xs text-slate-500 mb-2 uppercase font-bold">Team Completion</p>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {hackathonAnalytics.teamStats.map(ts => (
                                                                            <div key={ts.teamId} className="p-2 bg-slate-950 rounded-lg text-[10px] flex justify-between items-center">
                                                                                <span className="truncate mr-2">{ts.teamName}</span>
                                                                                <span className={`font-bold ${ts.evaluatedByCount === ts.totalJudges ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                                                    {ts.evaluatedByCount}/{ts.totalJudges}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-600 italic">Loading analytics...</div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {activeManagementTab === 'AUDIT' && (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-xs">
                                                            <thead>
                                                                <tr className="text-slate-500 border-b border-white/5">
                                                                    <th className="pb-2">Action</th>
                                                                    <th className="pb-2">User</th>
                                                                    <th className="pb-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-slate-300">
                                                                {hackathonAuditLogs.map(log => (
                                                                    <tr key={log.id} className="border-b border-white/5 last:border-0">
                                                                        <td className="py-2 font-semibold text-indigo-400">{log.action}</td>
                                                                        <td className="py-2">{log.userId}</td>
                                                                        <td className="py-2 text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {hackathonAuditLogs.length === 0 && (
                                                            <div className="p-8 text-center text-slate-600 italic">No logs found for this hackathon.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs or Extra Info */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <span className="w-8 h-1 bg-indigo-500 rounded-full mr-4"></span>
                                Rules & Requirements
                            </h2>
                            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                                <ul className="space-y-4 text-slate-400">
                                    <li className="flex items-start">
                                        <span className="text-indigo-500 mr-3 mt-1">✓</span>
                                        Max 4 members per team.
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-500 mr-3 mt-1">✓</span>
                                        Projects must be built during the event timeframe.
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-500 mr-3 mt-1">✓</span>
                                        Open-source projects only.
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
