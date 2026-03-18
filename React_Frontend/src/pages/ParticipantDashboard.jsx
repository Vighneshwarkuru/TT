import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
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
    const [myTeam, setMyTeam] = useState(null);
    const [activeTab, setActiveTab] = useState('Team Browser');

    // Load team info to conditionally render tabs
    useEffect(() => {
        axiosInstance.get('/api/participant/team')
            .then(r => setMyTeam(r.data))
            .catch(() => setMyTeam(null));
    }, []);

    const isLead = myTeam && myTeam.creatorId === user?.id;

    const TABS = [
        'Team Browser',
        ...(isLead ? ['Join Requests'] : []),
        'Team Profile',
        'Members',
        'Project Submission',
        'My Scores',
        'Leaderboard'
    ];

    const renderPanel = () => {
        switch (activeTab) {
            case 'Team Browser': return <TeamBrowserPanel />;
            case 'Join Requests': return <JoinRequestsPanel />;
            case 'Team Profile': return <TeamProfilePanel />;
            case 'Members': return <TeamMembersPanel />;
            case 'Project Submission': return <ProjectSubmissionPanel />;
            case 'My Scores': return <MyScoresPanel />;
            case 'Leaderboard': return <ParticipantLeaderboardPanel />;
            default: return <TeamBrowserPanel />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <header className="bg-indigo-700 text-white py-4 px-6 flex justify-between items-center shadow">
                <h1 className="text-2xl font-bold tracking-tight">VerdictSphere — Participant</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{user?.email}</span>
                    <button onClick={logout} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-semibold transition border border-indigo-500 hover:border-indigo-400 shadow-sm">
                        Logout
                    </button>
                </div>
            </header>

            <div className="bg-white border-b overflow-x-auto shadow-sm">
                <div className="flex px-6 space-x-8">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'border-indigo-700 text-indigo-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {renderPanel()}
            </main>
        </div>
    );
}
