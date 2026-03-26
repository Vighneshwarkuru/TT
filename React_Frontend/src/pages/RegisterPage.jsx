import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const schema = yup.object({
    firstName: yup.string().required('First name required'),
    lastName: yup.string().required('Last name required'),
    email: yup.string().email('Invalid email').required('Email required'),
    password: yup.string().min(6, 'Minimum 6 characters').required('Password required'),
});

export default function RegisterPage() {
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setApiError('');
        setSuccess('');
        try {
            await axiosInstance.post('/api/auth/register', data);
            setSuccess('Account created successfully. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please check your information.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', padding: '2rem 1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Link to="/" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', textDecoration: 'none' }}>
                        Verdict<span style={{ color: 'var(--accent)' }}>Sphere</span>
                    </Link>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
                        Join the hackathon evaluation platform.
                    </p>
                </div>

                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.375rem' }}>Create Account</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Fill in your details to get started.</p>
                    </header>

                    {apiError && (
                        <div className="badge badge-error" style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                            {apiError}
                        </div>
                    )}

                    {success && (
                        <div className="badge badge-success" style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="grid-responsive">
                            <div>
                                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>First Name</label>
                                <input
                                    {...register('firstName')}
                                    type="text"
                                    className="input"
                                    style={errors.firstName ? { borderColor: 'var(--error)' } : {}}
                                    placeholder="Jane"
                                />
                                {errors.firstName && <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--error)', fontWeight: 600 }}>{errors.firstName.message}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Last Name</label>
                                <input
                                    {...register('lastName')}
                                    type="text"
                                    className="input"
                                    style={errors.lastName ? { borderColor: 'var(--error)' } : {}}
                                    placeholder="Doe"
                                />
                                {errors.lastName && <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--error)', fontWeight: 600 }}>{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input"
                                style={errors.email ? { borderColor: 'var(--error)' } : {}}
                                placeholder="email@example.com"
                            />
                            {errors.email && <p style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--error)', fontWeight: 600 }}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>Password</label>
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
                            {isSubmitting ? 'SIGNING UP...' : 'SIGN UP'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', paddingTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>
                                LOGIN
                            </Link>
                        </p>
                    </div>
                </div>

                <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.025em' }}>&copy; 2026 VERDICTSPHERE. ALL RIGHTS RESERVED.</p>
                </footer>
            </div>
        </div>
    );
}
