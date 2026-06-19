import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage({ setCurrentUser }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    if (users.some((item) => item.email === form.email)) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      password: form.password
    };

    users.push(newUser);
    window.localStorage.setItem('vidshopUsers', JSON.stringify(users));
    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email };
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
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
        </div>
      </nav>

      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-header">
            <span className="section-eyebrow">Get started</span>
            <h1>Create account</h1>
            <p>Join and enjoy seamless video downloads.</p>
          </div>

          {error && (
            <div className="message-banner message-banner--error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-fields">
              <div>
                <label className="field-label">Name</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
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
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="field-label">Confirm password</label>
                <input
                  className="field-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full">
              Create account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
