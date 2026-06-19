import { useNavigate } from 'react-router-dom';

function AdminDashboard({
  videos,
  title,
  setTitle,
  file,
  setFile,
  message,
  setMessage,
  progress,
  isAdmin,
  adminKey,
  setAdminKey,
  handleAdminLogin,
  handleAdminLogout,
  handleUpload,
  deleteVideo,
  search,
  setSearch,
  handleSearch,
  page,
  totalPages,
  changePage
}) {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || '';

  const isError = message && (
    message.toLowerCase().includes('fail') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('please')
  );

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: 'default' }}>
          <div className="navbar-logo">V</div>
          <span className="navbar-name">VidShop</span>
        </div>
        <div className="navbar-actions">
          {isAdmin && (
            <span className="user-pill">
              <div className="user-avatar">A</div>
              Admin
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back to site
          </button>
        </div>
      </nav>

      <div className="dashboard-shell">
        <aside className="sidebar">
          <p className="sidebar-heading">Navigation</p>
          <button className="sidebar-btn active">
            <span className="sidebar-icon">⊞</span> Dashboard
          </button>
          <button className="sidebar-btn" onClick={() => navigate('/')}>
            <span className="sidebar-icon">▶</span> View site
          </button>
          <div className="sidebar-divider" />
          <div className="sidebar-spacer" />
          {isAdmin && (
            <button className="sidebar-btn" onClick={handleAdminLogout}>
              <span className="sidebar-icon">↩</span> Logout
            </button>
          )}
        </aside>

        <div className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <span className="section-eyebrow">Overview</span>
              <h1 className="section-title">Admin Dashboard</h1>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-card__value">{videos.length}</div>
              <div className="stat-card__label">Videos (this page)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{totalPages}</div>
              <div className="stat-card__label">Total pages</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{isAdmin ? 'Active' : 'Locked'}</div>
              <div className="stat-card__label">Admin access</div>
            </div>
          </div>

          {message && (
            <div className={`message-banner ${isError ? 'message-banner--error' : 'message-banner--success'}`}>
              {message}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>{isAdmin ? 'Upload New Video' : 'Admin Authentication'}</h3>
            </div>
            <div className="card-body">
              {isAdmin ? (
                <form onSubmit={handleUpload} className="upload-form">
                  <div className="upload-field">
                    <label className="field-label">Video title</label>
                    <input
                      className="field-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for this video"
                    />
                  </div>
                  <div className="upload-field">
                    <label className="field-label">Video file</label>
                    <label className="file-drop file-drop-label">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>↑</div>
                      <div>{file ? file.name : 'Click to choose a video file'}</div>
                      <div style={{ fontSize: '0.78rem', marginTop: '6px', color: 'var(--muted)' }}>
                        Max 200 MB
                      </div>
                    </label>
                  </div>
                  {progress > 0 && (
                    <div>
                      <div className="progress-label">
                        <span>Uploading…</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-wrap">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary btn-lg">
                    Upload video
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="upload-form">
                  <div className="upload-field">
                    <label className="field-label">Admin key</label>
                    <input
                      className="field-input"
                      value={adminKey}
                      type="password"
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter your admin key"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg">
                    Authenticate
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Manage Videos</h3>
              <form onSubmit={handleSearch} className="search-bar">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
              </form>
            </div>

            {videos.length === 0 ? (
              <div className="card-body" style={{ textAlign: 'center', color: 'var(--muted)', padding: '48px 24px' }}>
                No videos found
              </div>
            ) : (
              <ul className="admin-video-list">
                {videos.map((video) => (
                  <li key={video._id} className="admin-video-item">
                    <div className="admin-video-info">
                      <strong>{video.title}</strong>
                      <span>
                        {new Date(video.uploadedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="admin-video-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
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
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteVideo(video._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="pagination" style={{ paddingBottom: '24px' }}>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
