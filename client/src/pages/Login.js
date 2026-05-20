import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingCard from '../components/FloatingCard';
import { getLoginBackground, getCachedImage, setCachedImage } from '../services/unsplashService';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load background image from cache or Unsplash
    const cachedBg = getCachedImage('loginBg');
    if (cachedBg) {
      setBackgroundImage(cachedBg);
    } else {
      getLoginBackground().then((imageUrl) => {
        if (imageUrl) {
          setBackgroundImage(imageUrl);
          setCachedImage('loginBg', imageUrl);
        }
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-page"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(26, 31, 60, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      <div className="scene-container">
        <FloatingCard />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="finova-logo">F</div>
          <h1>Welcome to Finova</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
