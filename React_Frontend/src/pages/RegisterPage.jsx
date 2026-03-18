import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card: { background: '#fff', padding: 40, borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: 380 },
  title: { fontSize: 26, fontWeight: 700, color: '#1976d2', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  error: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  btn: { width: '100%', padding: '11px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  apiError: { background: '#fdecea', color: '#c62828', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
};

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
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Create Account</div>
        {apiError && <div style={styles.apiError}>{apiError}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input style={styles.input} {...register('firstName')} placeholder="Jane" />
              {errors.firstName && <div style={styles.error}>{errors.firstName.message}</div>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input style={styles.input} {...register('lastName')} placeholder="Doe" />
              {errors.lastName && <div style={styles.error}>{errors.lastName.message}</div>}
            </div>
          </div>
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
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
