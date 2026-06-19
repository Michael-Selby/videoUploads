import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupPage({ setCurrentUser, setMessage }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    if (users.some((item) => item.email === form.email)) {
      setMessage('An account with this email already exists.');
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
    setMessage(`Account created for ${newUser.name}.`);
    navigate('/');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card auth-card--wide">
        <div className="auth-side auth-side--brand">
          <span className="eyebrow">VidShop</span>
          <h1>Create your account</h1>
          <p>Join thousands of users and enjoy seamless video downloads.</p>
        </div>
        <div className="auth-side auth-side--form">
          <form onSubmit={handleSubmit} className="auth-form auth-form--stacked">
            <h2>Sign up</h2>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
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
                placeholder="At least 6 characters"
              />
            </div>
            <div className="input-group">
              <label>Confirm password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
              />
            </div>
            <button type="submit" className="auth-submit">Create account</button>
            <p className="auth-switch">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
