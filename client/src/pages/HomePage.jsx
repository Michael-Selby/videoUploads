import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function VideoModal({ video, apiBase, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const streamUrl = `${apiBase}/api/videos/${video._id}/stream`;
  const downloadUrl = `${apiBase}/api/videos/${video._id}/download`;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 ** 3)).toFixed(1)} GB`;
    return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <p className="modal-meta">
              {new Date(video.uploadedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
              {video.size ? ` · ${formatSize(video.size)}` : ''}
            </p>
            <h2 className="modal-title">{video.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-player">
          <video
            ref={videoRef}
            src={streamUrl}
            controls
            autoPlay
            playsInline
            className="modal-video"
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
          >
            ↓ Download
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, apiBase, onPlay }) {
  const streamUrl = `${apiBase}/api/videos/${video._id}/stream`;

  return (
    <div className="video-card">
      <div className="video-card__thumb" onClick={onPlay}>
        <video
          src={`${streamUrl}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          tabIndex={-1}
          className="video-card__preview"
        />
        <div className="play-overlay">
          <div className="play-btn">▶</div>
        </div>
      </div>
      <div className="video-card__body">
        <p className="video-card__title">{video.title}</p>
        <p className="video-card__meta">
          {new Date(video.uploadedAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </p>
        <div className="video-card__footer">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onPlay}>
            Watch
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.open(`${apiBase}/api/videos/${video._id}/download`, '_blank', 'noopener,noreferrer')}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [activeVideo, setActiveVideo] = useState(null);

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
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Sign up</button>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>Admin</button>
        </div>
      </nav>

      <div className="home-page">
        <div className="home-top">
          <div>
            <span className="section-eyebrow">Library</span>
            <h1 className="section-title">Browse Videos</h1>
            <p className="section-subtitle">
              {videos.length > 0 ? `${videos.length} video${videos.length !== 1 ? 's' : ''} on this page` : 'No videos yet'}
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos…"
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
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
              <VideoCard
                key={video._id}
                video={video}
                apiBase={apiBase}
                onPlay={() => setActiveVideo(video)}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => changePage(page - 1)} disabled={page <= 1}>
              ← Previous
            </button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => changePage(page + 1)} disabled={page >= totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          apiBase={apiBase}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
