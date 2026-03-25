import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 font-bold text-xl">V</div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VerdictSphere — Admin</h1>
            </div>
            <div className="flex items-center space-x-6">
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-white leading-none mb-1">{user?.email}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Administrator</p>
                </div>
                <button onClick={logout} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-white/10 hover:border-white/20">
                    Logout
                </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Hackathon Center</h2>
                    <p className="text-slate-400 text-lg max-w-2xl">Manage your innovation ecosystem. Create, monitor, and evaluate hackathons from a single command center.</p>
                </div>
                <button 
                    onClick={() => setActiveTab('Hackathons')}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                    + Create Hackathon
                </button>
            </div>

            {activeTab !== 'Overview' ? (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="mb-8 flex space-x-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 overflow-x-auto">
                        {['Overview', 'Hackathons', 'Judges', 'Users', 'Criteria', 'Teams', 'Evaluations', 'Results', 'Audit'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {renderPanel()}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hackathons.map(h => (
                        <div 
                            key={h.id}
                            onClick={() => navigate(`/hackathon/${h.id}`)}
                            className="group relative bg-slate-900 rounded-[2rem] p-8 border border-white/5 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                                        <span className="text-2xl group-hover:rotate-12 transition-transform">🏆</span>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${h.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {h.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">{h.name}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                    {h.description || "Project management and evaluation workspace."}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Teams</p>
                                        <p className="text-lg font-bold">--</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Judges</p>
                                        <p className="text-lg font-bold">--</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center text-sm font-bold text-emerald-400 group-hover:translate-x-2 transition-transform duration-300">
                                    Open Management <span className="ml-2">→</span>
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
            )}
        </main>
    </div>
  );
}
