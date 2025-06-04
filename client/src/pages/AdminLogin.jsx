import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';
import { useToast } from '../context/ToastContext';

const AdminLogin = () => {
  const { addToast } = useToast();

  const adminMail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (email === adminMail && password === adminPassword) {
      addToast(
        { title: 'Success', body: 'Welcome Admin !' },
        'success'
      );
      navigate('/admin-dashboard');
    } else {
      addToast(
        { title: 'Error', body: 'Invalid Credentials !' },
        'error'
      );
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1 className="admin-brand" onClick={() => navigate('/')}>REQUESTHUB</h1>
      </div>

      <div className="admin-form-container">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2 className="admin-title">ADMIN PORTAL</h2>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-input-group">
            <input
              className="admin-input"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="admin-label">Email</label>
          </div>

          <div className="admin-input-group">
            <input
              className="admin-input"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="admin-label">Password</label>
          </div>

          <button className="admin-button" type="submit">Into Dashboard</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;