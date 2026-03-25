import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
    TeamBrowserPanel,
    JoinRequestsPanel,
    TeamProfilePanel,
    TeamMembersPanel,
    ProjectSubmissionPanel,
    MyScoresPanel,
    ParticipantLeaderboardPanel
} from '../components/participant/ParticipantPanels';

export default function ParticipantDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [myTeam, setMyTeam] = useState(null);
    const [hackathons, setHackathons] = useState([]);
    const [activeTab, setActiveTab] = useState('Team Browser');

    // Load team and hackathon info
    useEffect(() => {
        axiosInstance.get('/api/participant/team')
            .then(r => setMyTeam(r.data))
            .catch(() => setMyTeam(null));

        axiosInstance.get('/api/public/active-hackathons')
            .then(r => setHackathons(r.data))
            .catch(() => setHackathons([]));
    }, []);

    const isLead = myTeam && myTeam.createdBy?.id === user?.id;

    // We'll keep the top-level dashboard simple: just Hackathon Cards.
    // The specific team management will happen INSIDE the hackathon page (or we can keep it here if preferred).
    // User said: "the entire ui should revolve around the names of the hackathons so for each hackathon there should be a new page"
    
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 font-bold text-xl">V</div>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VerdictSphere</h1>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-white leading-none mb-1">{user?.email}</p>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-white/10 hover:border-white/20">
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12">
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Active Hackathons</h2>
                    <p className="text-slate-400 text-lg max-w-2xl">Discover and register for the latest innovation challenges. Your journey to excellence starts here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hackathons.map(h => (
                        <div 
                            key={h.id}
                            onClick={() => navigate(`/hackathon/${h.id}`)}
                            className="group relative bg-slate-900 rounded-[2rem] p-8 border border-white/5 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
                                    <span className="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{h.name}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                    {h.description || "No description provided."}
                                </p>
                                
                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="mr-2">📅</span> Deadline: {h.registrationDeadline}
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="mr-2">🏁</span> Starts: {h.startDate}
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center text-sm font-bold text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                                    Explore & Register <span className="ml-2">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {hackathons.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-[2.5rem] border border-dashed border-white/10">
                            <p className="text-slate-500 text-xl font-medium">No active hackathons found at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
