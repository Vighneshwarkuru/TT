import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    JudgeTeamAcceptancePanel,
    AssignedTeamsPanel,
    EvaluationFormPanel,
    MyEvaluationsPanel,
    JudgeLeaderboardPanel
} from '../components/judge/JudgePanels';

const TABS = ['Team Acceptance', 'Assigned Teams', 'Evaluation Form', 'My Evaluations', 'Leaderboard'];

export default function JudgeDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const renderPanel = () => {
        switch (activeTab) {
            case 'Team Acceptance': return <JudgeTeamAcceptancePanel />;
            case 'Assigned Teams': return <AssignedTeamsPanel />;
            case 'Evaluation Form': return <EvaluationFormPanel />;
            case 'My Evaluations': return <MyEvaluationsPanel />;
            case 'Leaderboard': return <JudgeLeaderboardPanel />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <header className="bg-indigo-600 text-white py-4 px-6 flex justify-between items-center shadow">
                <h1 className="text-2xl font-bold tracking-tight">VerdictSphere — Judge</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{user?.email}</span>
                    <button onClick={logout} className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded text-sm font-semibold transition">
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
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
