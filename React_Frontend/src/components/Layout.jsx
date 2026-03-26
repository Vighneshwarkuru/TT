import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-soft)' }}>
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--border)', 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Verdict<span style={{ color: 'var(--accent)' }}>Sphere</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1 }}>{user?.email}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        {children}
      </main>

      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', background: 'white', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          &copy; {new Date().getFullYear()} VerdictSphere. The hackathon evaluation platform.
        </div>
      </footer>
    </div>
  );
}
