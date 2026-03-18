import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OverviewPanel from '../components/admin/OverviewPanel';
import HackathonManagerPanel from '../components/admin/HackathonManagerPanel';
import JudgeManagementPanel from '../components/admin/JudgeManagementPanel';
import UserManagerPanel from '../components/admin/UserManagerPanel';
import CriteriaManagerPanel from '../components/admin/CriteriaManagerPanel';
import TeamManagerPanel from '../components/admin/TeamManagerPanel';
import EvaluationMonitorPanel from '../components/admin/EvaluationMonitorPanel';
import ResultsGeneratorPanel from '../components/admin/ResultsGeneratorPanel';
import AuditViewerPanel from '../components/admin/AuditViewerPanel';

const TABS = ['Overview', 'Hackathons', 'Judges', 'Users', 'Criteria', 'Teams', 'Evaluations', 'Results', 'Audit'];

const styles = {
  container: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#1976d2', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 700, margin: 0 },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  tabBar: { background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', overflowX: 'auto', padding: '0 16px' },
  tab: { padding: '14px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#666', borderBottom: '3px solid transparent', whiteSpace: 'nowrap' },
  tabActive: { color: '#1976d2', borderBottom: '3px solid #1976d2' },
  content: { padding: 24, maxWidth: 1100, margin: '0 auto' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>VerdictSphere — Admin</span>
        <span style={{ fontSize: 13, marginRight: 16 }}>{user?.email}</span>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <div
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div style={styles.content}>{renderPanel()}</div>
    </div>
  );
}
