import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';
import {
    TeamBrowserPanel,
    JoinRequestsPanel,
    TeamProfilePanel,
    TeamMembersPanel,
    ProjectSubmissionPanel,
    MyScoresPanel,
    ParticipantLeaderboardPanel
} from '../components/participant/ParticipantPanels';

const BASE_TABS = ['Team Browser', 'Team Profile', 'Members', 'Project Submission', 'My Scores', 'Leaderboard'];

export default function ParticipantDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Team Browser');
    const [hackathons, setHackathons] = useState([]);
    const [myTeam, setMyTeam] = useState(null);

    useEffect(() => {
        axiosInstance.get('/api/public/active-hackathons')
            .then(r => setHackathons(r.data))
            .catch(() => setHackathons([]));
        axiosInstance.get('/api/participant/team')
            .then(r => setMyTeam(r.data))
            .catch(() => setMyTeam(null));
    }, []);

    const isLead = myTeam && myTeam.createdBy?.id === user?.id;
    const tabs = isLead
        ? ['Team Browser', 'Join Requests', 'Team Profile', 'Members', 'Project Submission', 'My Scores', 'Leaderboard']
        : BASE_TABS;

    const renderPanel = () => {
        switch (activeTab) {
            case 'Team Browser': return <TeamBrowserPanel hackathons={hackathons} />;
            case 'Join Requests': return <JoinRequestsPanel />;
            case 'Team Profile': return <TeamProfilePanel hackathons={hackathons} />;
            case 'Members': return <TeamMembersPanel />;
            case 'Project Submission': return <ProjectSubmissionPanel />;
            case 'My Scores': return <MyScoresPanel />;
            case 'Leaderboard': return <ParticipantLeaderboardPanel />;
            default: return null;
        }
    };

    return (
        <Layout>
            <div className="container" style={{ paddingBottom: '3rem' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                        Welcome, <span style={{ color: 'var(--accent)' }}>{user?.firstName || 'Participant'}</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Manage your team, track progress, and submit your project.
                    </p>
                </header>

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <nav style={{ borderBottom: '1px solid var(--border)', overflowX: 'auto', display: 'flex', background: 'var(--bg-soft)' }}>
                        {tabs.map(tab => (
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
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
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
