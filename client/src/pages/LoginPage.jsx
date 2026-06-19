import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ setCurrentUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    const user = users.find(
      (item) => item.email === form.email && item.password === form.password
    );

    if (!user) {
      setError('Invalid email or password.');
      return;
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    window.localStorage.setItem('vidshopUser', JSON.stringify(safeUser));
    setCurrentUser(safeUser);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">V</div>
          <span className="navbar-name">VidShop</span>
        </Link>
        <div className="navbar-actions">
          <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
        </div>
      </nav>

      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-header">
            <span className="section-eyebrow">Welcome back</span>
            <h1>Login</h1>
            <p>Sign in to browse and download videos.</p>
          </div>

          {error && (
            <div className="message-banner message-banner--error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-fields">
              <div>
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full">
              Login
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
