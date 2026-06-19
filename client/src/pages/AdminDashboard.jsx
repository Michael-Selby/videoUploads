import { useState } from 'react';

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
  fetchVideos,
  search,
  setSearch,
  handleSearch,
  page,
  totalPages,
  changePage,
  setAuthMode
}) {
  const apiBase = import.meta.env.VITE_API_URL || '';
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <h2>VidShop</h2>
          <p>Admin panel</p>
        </div>
        <button className="sidebar-btn active">Dashboard</button>
        <button className="sidebar-btn" onClick={() => setAuthMode('login')}>
          Back to user view
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">Overview</span>
            <h1>Admin Dashboard</h1>
          </div>
          {isAdmin ? (
            <button className="logout-button" onClick={handleAdminLogout}>Logout</button>
          ) : null}
        </header>

        <section className="card dashboard-card">
          <div className="dashboard-card__title-row">
            <h3>Upload new video</h3>
          </div>

          {isAdmin ? (
            <form onSubmit={handleUpload} className="upload-form dashboard-upload-form">
              <label>
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                />
              </label>
              <label>
                Video file
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <button type="submit">Upload video</button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="upload-form dashboard-upload-form">
              <label>
                Admin key
                <input
                  value={adminKey}
                  type="password"
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                />
              </label>
              <button type="submit">Authenticate</button>
            </form>
          )}
          {progress > 0 && (
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}
        </section>

        <section className="card dashboard-card">
          <div className="dashboard-card__title-row">
            <h3>Manage videos</h3>
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

          <ul className="video-list dashboard-video-list">
            {videos.map((video) => (
              <li key={video._id} className="video-item dashboard-video-item">
                <div>
                  <strong>{video.title}</strong>
                  <p>{new Date(video.uploadedAt).toLocaleString()}</p>
                </div>
                <div className="dashboard-actions">
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
                  <button className="delete-button" onClick={() => deleteVideo(video._id)}>
                    Delete
                  </button>
                </div>
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
      </main>
    </div>
  );
}

export default AdminDashboard;
