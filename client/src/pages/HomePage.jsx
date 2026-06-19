import { useNavigate } from 'react-router-dom';

function HomePage({
  videos,
  search,
  setSearch,
  page,
  totalPages,
  message,
  handleSearch,
  changePage,
  currentUser,
  handleLogout,
  setAuthMode
}) {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || '';

  return (
    <div className="home-shell">
      <header className="home-header">
        <div>
          <span className="eyebrow">VidShop</span>
          <h1>Browse videos</h1>
        </div>
        <div className="home-header__actions">
          {currentUser ? (
            <>
              <span className="user-pill">{currentUser.name}</span>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="logout-button" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="logout-button" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            </>
          )}
          <button
            className="logout-button admin-button"
            onClick={() => navigate('/admin')}
            style={{ background: '#0055DA', color: '#fff', fontWeight: 700 }}
          >
            Admin
          </button>
        </div>
      </header>

      <section className="card list-card home-list-card">
        <div className="list-header">
          <h2>Available videos</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos"
            />
            <button type="submit">Search</button>
          </form>
        </div>
        {message && <p className="message">{message}</p>}

        <ul className="video-list">
          {videos.map((video) => (
            <li key={video._id} className="video-item">
              <div>
                <strong>{video.title}</strong>
                <p>{new Date(video.uploadedAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                className="download-button"
                onClick={() =>
                  window.open(
                    `${apiBase}/api/videos/${video._id}/download`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              >
                Download
              </button>
            </li>
          ))}
        </ul>

        <div className="pagination">
          <button onClick={() => changePage(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => changePage(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
