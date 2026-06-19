import { useEffect, useState } from 'react';
import AppRoutes from './routes';

const API_URL = '/api/videos';
const MAX_UPLOAD_BYTES = 1024 * 1024 * 200; // 200MB client-side limit

function App() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminKey, setAdminKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(window.localStorage.getItem('vidshopUser') || 'null');
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    const checkSavedKey = async () => {
      const savedKey = window.localStorage.getItem('videoAdminKey') || '';
      if (!savedKey) {
        fetchVideos(1, search);
        return;
      }

      const res = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'x-admin-key': savedKey }
      });

      if (res.ok) {
        setAdminKey(savedKey);
        setIsAdmin(true);
      } else {
        window.localStorage.removeItem('videoAdminKey');
      }

      fetchVideos(1, search);
    };

    checkSavedKey();
  }, []);

  const fetchVideos = async (newPage = 1, query = '') => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', '8');
    if (query) params.set('q', query);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();
    setVideos(data.videos || []);
    setPage(data.page || 1);
    setTotalPages(data.totalPages || 1);
  };

  const handleUpload = (event) => {
    event.preventDefault();
    setMessage('');

    if (!isAdmin) {
      setMessage('Please login as admin before uploading.');
      return;
    }
    if (!title || !file) {
      setMessage('Please add a title and select a video file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage('Video must be 200MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('x-admin-key', adminKey);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = async () => {
      setProgress(0);
      if (xhr.status === 201) {
        setTitle('');
        setFile(null);
        setMessage('Video uploaded successfully.');
        fetchVideos(page, search);
      } else {
        const data = JSON.parse(xhr.responseText || '{}');
        setMessage(data.message || 'Upload failed.');
      }
    };

    xhr.onerror = () => {
      setProgress(0);
      setMessage('Upload failed due to a network error.');
    };

    xhr.send(formData);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    if (!adminKey.trim()) {
      setMessage('Enter the admin key to authenticate.');
      return;
    }

    const res = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey
      }
    });

    if (res.ok) {
      window.localStorage.setItem('videoAdminKey', adminKey);
      setIsAdmin(true);
      setMessage('Admin authenticated. You can now upload videos.');
    } else {
      setIsAdmin(false);
      window.localStorage.removeItem('videoAdminKey');
      const data = await res.json();
      setMessage(data.message || 'Invalid admin key.');
    }
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem('videoAdminKey');
    setAdminKey('');
    setIsAdmin(false);
    setMessage('Logged out.');
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${videoId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Could not delete video.');
        return;
      }

      setMessage('Video deleted successfully.');
      fetchVideos(page, search);
    } catch (error) {
      setMessage('Delete failed.');
    }
  };

  const handleUserLogin = (event) => {
    event.preventDefault();
    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    const user = users.find(
      (item) => item.email === loginForm.email && item.password === loginForm.password
    );

    if (!user) {
      setMessage('Invalid email or password.');
      return;
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    window.localStorage.setItem('vidshopUser', JSON.stringify(safeUser));
    setCurrentUser(safeUser);
    setMessage(`Welcome back, ${user.name}!`);
  };

  const handleSignup = (event) => {
    event.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (signupForm.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const users = JSON.parse(window.localStorage.getItem('vidshopUsers') || '[]');
    if (users.some((item) => item.email === signupForm.email)) {
      setMessage('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password
    };

    users.push(newUser);
    window.localStorage.setItem('vidshopUsers', JSON.stringify(users));
    window.localStorage.setItem(
      'vidshopUser',
      JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email })
    );
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
    setMessage(`Account created for ${newUser.name}.`);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('vidshopUser');
    setCurrentUser(null);
    setMessage('You have been logged out.');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchVideos(1, search);
  };

  const changePage = (newPage) => {
    fetchVideos(newPage, search);
  };

  return (
    <div className="app-shell">
      <AppRoutes
        videos={videos}
        search={search}
        setSearch={setSearch}
        page={page}
        totalPages={totalPages}
        message={message}
        handleSearch={handleSearch}
        changePage={changePage}
        currentUser={currentUser}
        handleLogout={handleLogout}
        setCurrentUser={setCurrentUser}
        setMessage={setMessage}
        title={title}
        setTitle={setTitle}
        file={file}
        setFile={setFile}
        progress={progress}
        isAdmin={isAdmin}
        adminKey={adminKey}
        setAdminKey={setAdminKey}
        handleAdminLogin={handleAdminLogin}
        handleAdminLogout={handleAdminLogout}
        handleUpload={handleUpload}
        deleteVideo={deleteVideo}
        fetchVideos={fetchVideos}
        setAuthMode={setAuthMode}
      />
    </div>
  );
}

export default App;
