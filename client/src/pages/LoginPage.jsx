import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setCurrentUser, setMessage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    const user = users.find(
      (item) => item.email === form.email && item.password === form.password
    );

    if (!user) {
      setMessage('Invalid email or password.');
      return;
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    window.localStorage.setItem('vidshopUser', JSON.stringify(safeUser));
    setCurrentUser(safeUser);
    setMessage(`Welcome back, ${user.name}!`);
    navigate('/');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card auth-card--wide">
        <div className="auth-side auth-side--brand">
          <span className="eyebrow">VidShop</span>
          <h1>Welcome back</h1>
          <p>Sign in to browse and download your favorite videos.</p>
        </div>
        <div className="auth-side auth-side--form">
          <form onSubmit={handleSubmit} className="auth-form auth-form--stacked">
            <h2>Login</h2>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="auth-submit">Login</button>
            <p className="auth-switch">
              Don’t have an account? <a href="/signup">Create one</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
