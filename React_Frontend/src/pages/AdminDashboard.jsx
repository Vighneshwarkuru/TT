import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';
import OverviewPanel from '../components/admin/OverviewPanel';
import HackathonManagerPanel from '../components/admin/HackathonManagerPanel';
import JudgeManagementPanel from '../components/admin/JudgeManagementPanel';
import UserManagerPanel from '../components/admin/UserManagerPanel';
import CriteriaManagerPanel from '../components/admin/CriteriaManagerPanel';
import TeamManagerPanel from '../components/admin/TeamManagerPanel';
import EvaluationMonitorPanel from '../components/admin/EvaluationMonitorPanel';
import ResultsGeneratorPanel from '../components/admin/ResultsGeneratorPanel';
import AuditViewerPanel from '../components/admin/AuditViewerPanel';

export default function AdminDashboard() {
  const { navigate } = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/hackathons');
      setHackathons(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewPanel />;
      case 'Hackathons': return <HackathonManagerPanel />;
      case 'Judges': return <JudgeManagementPanel />;
      case 'Users': return <UserManagerPanel />;
      case 'Criteria': return <CriteriaManagerPanel />;
      case 'Teams': return <TeamManagerPanel />;
      case 'Evaluations': return <EvaluationMonitorPanel />;
      case 'Results': return <ResultsGeneratorPanel />;
      case 'Audit': return <AuditViewerPanel />;
      default: return null;
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading Dashboard...</p>
        </div>
    </div>
  );

  return (
    <Layout>
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                        Admin <span style={{ color: 'var(--accent)' }}>Dashboard</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px' }}>
                        Manage all platform users, judges, and hackathons in one place.
                    </p>
                </div>
                <button 
                    onClick={() => setActiveTab('Hackathons')}
                    className="btn btn-primary"
                    style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}
                >
                    + Create Hackathon
                </button>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '3rem' }}>
                <nav style={{ borderBottom: '1px solid var(--border)', overflowX: 'auto', display: 'flex', background: 'var(--bg-soft)' }}>
                    {['Overview', 'Hackathons', 'Judges', 'Users', 'Criteria', 'Teams', 'Evaluations', 'Results', 'Audit'].map(tab => (
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
                    {activeTab !== 'Overview' ? (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            {renderPanel()}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-soft)', paddingBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Managed Hackathons</h3>
                                <span className="badge">{hackathons.length} Total</span>
                            </div>
                            
                            {hackathons.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                    {hackathons.map(h => (
                                        <div 
                                            key={h.id}
                                            onClick={() => navigate(`/hackathon/${h.id}`)}
                                            className="card"
                                            style={{ cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{h.name}</h4>
                                                <span className={`badge ${h.isActive ? 'badge-success' : ''}`}>
                                                    {h.isActive ? 'Active' : 'Draft'}
                                                </span>
                                            </div>
                                            
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em', marginBottom: '1.5rem' }}>
                                                {h.description || "Project management and evaluation workspace."}
                                            </p>
                                            
                                            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--bg-soft)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ textAlign: 'center', flex: 1 }}>
                                                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Teams</p>
                                                    <p style={{ fontWeight: 800, fontSize: '1.125rem' }}>--</p>
                                                </div>
                                                <div style={{ borderLeft: '1px solid var(--bg-soft)', height: '24px', alignSelf: 'center' }}></div>
                                                <div style={{ textAlign: 'center', flex: 1 }}>
                                                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Judges</p>
                                                    <p style={{ fontWeight: 800, fontSize: '1.125rem' }}>--</p>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                View Hackathon &rarr;
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                    <p>No hackathons found. Click "+ Create Hackathon" to start.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </Layout>
  );
}
