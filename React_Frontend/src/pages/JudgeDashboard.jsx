import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
    JudgeTeamAcceptancePanel,
    AssignedTeamsPanel,
    EvaluationFormPanel,
    MyEvaluationsPanel,
    JudgeLeaderboardPanel
} from '../components/judge/JudgePanels';

const TABS = ['Team Acceptance', 'Assigned Teams', 'Evaluation Form', 'My Evaluations', 'Leaderboard'];

export default function JudgeDashboard() {
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
        <Layout>
            <div className="container" style={{ paddingBottom: '3rem' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                        Judge <span style={{ color: 'var(--accent)' }}>Panel</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Manage evaluations, review teams, and track scores.
                    </p>
                </header>

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <nav style={{ borderBottom: '1px solid var(--border)', overflowX: 'auto', display: 'flex', background: 'var(--bg-soft)' }}>
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                                    background: activeTab === tab ? 'white' : 'transparent',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    <div style={{ padding: '2rem' }}>
                        {renderPanel()}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
