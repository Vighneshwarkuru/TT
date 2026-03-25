import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
    email: yup.string().email('Invalid email protocol').required('Identity required'),
    password: yup.string().required('Authorization required'),
});

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setApiError('');
        try {
            const res = await axiosInstance.post('/api/auth/login', data);
            login(res.data);
            const role = res.data.role;
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'JUDGE') navigate('/judge');
            else navigate('/participant');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Authentication sequence failed. Verify credentials and network status.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', padding: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Link to="/" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', textDecoration: 'none' }}>
                        Verdict<span style={{ color: 'var(--accent)' }}>Sphere</span>
                    </Link>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
                        High-precision evaluation ecosystem.
                    </p>
                </div>

                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.375rem' }}>Authentication</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Synchronize your identity to proceed.</p>
                    </header>

                    {apiError && (
                        <div className="badge badge-error" style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Identity (Email)</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input"
                                style={errors.email ? { borderColor: 'var(--error)' } : {}}
                                placeholder="architect@verdictsphere.io"
                            />
                            {errors.email && <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--error)', fontWeight: 600 }}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Authorization (Password)</label>
                            </div>
                            <input
                                {...register('password')}
                                type="password"
                                className="input"
                                style={errors.password ? { borderColor: 'var(--error)' } : {}}
                                placeholder="••••••••"
                            />
                            {errors.password && <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--error)', fontWeight: 600 }}>{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', letterSpacing: '0.05em' }}
                        >
                            {isSubmitting ? 'SYNCHRONIZING...' : 'INITIALIZE SESSION'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', paddingTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            New architect?{' '}
                            <Link to="/register" style={{ fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>
                                ESTABLISH ACCOUNT
                            </Link>
                        </p>
                    </div>
                </div>
                
                <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                   <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.025em' }}>&copy; 2026 VERDICTSPHERE ECOSYSTEM. ALL RIGHTS RESERVED.</p>
                </footer>
            </div>
        </div>
    );
}
