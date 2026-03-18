import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card: { background: '#fff', padding: 40, borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: 360 },
  title: { fontSize: 26, fontWeight: 700, color: '#1976d2', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  error: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  btn: { width: '100%', padding: '11px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  apiError: { background: '#fdecea', color: '#c62828', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' },
};

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
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>VerdictSphere</div>
        {apiError && <div style={styles.apiError}>{apiError}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" {...register('email')} placeholder="you@example.com" />
            {errors.email && <div style={styles.error}>{errors.email.message}</div>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <div style={styles.error}>{errors.password.message}</div>}
          </div>
          <button style={styles.btn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.footer}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
