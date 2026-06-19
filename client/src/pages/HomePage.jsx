import { useNavigate, Link } from 'react-router-dom';

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
  handleLogout
}) {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || '';

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const isError = message && (
    message.toLowerCase().includes('fail') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('error')
  );

  return (
    <div className="app-shell">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">V</div>
          <span className="navbar-name">VidShop</span>
        </Link>

        <div className="navbar-actions">
          {currentUser ? (
            <>
              <div className="user-pill">
                <div className="user-avatar">{initials}</div>
                {currentUser.name}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>
            Admin
          </button>
        </div>
      </nav>

      <div className="home-page">
        <div className="home-top">
          <div>
            <span className="section-eyebrow">Library</span>
            <h1 className="section-title">Browse Videos</h1>
            <p className="section-subtitle">{videos.length > 0 ? `${videos.length} videos on this page` : 'No videos yet'}</p>
          </div>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos…"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </div>

        {message && (
          <div className={`message-banner ${isError ? 'message-banner--error' : 'message-banner--success'}`}>
            {message}
          </div>
        )}

        <div className="video-grid">
          {videos.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>▶</div>
              <h3>No videos found</h3>
              <p>Try a different search or check back later.</p>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video._id} className="video-card">
                <div className="video-card__thumb">▶</div>
                <div className="video-card__body">
                  <p className="video-card__title">{video.title}</p>
                  <p className="video-card__meta">
                    {new Date(video.uploadedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <div className="video-card__footer">
                    <span className="video-card__badge">MP4</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
            >
              ← Previous
            </button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
