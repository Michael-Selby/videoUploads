import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes({
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
  setCurrentUser,
  setMessage,
  title,
  setTitle,
  file,
  setFile,
  progress,
  isAdmin,
  adminKey,
  setAdminKey,
  handleAdminLogin,
  handleAdminLogout,
  handleUpload,
  deleteVideo,
  fetchVideos,
  setAuthMode
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
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
            setAuthMode={setAuthMode}
          />
        }
      />
      <Route
        path="/login"
        element={<LoginPage setCurrentUser={setCurrentUser} setMessage={setMessage} />}
      />
      <Route
        path="/signup"
        element={<SignupPage setCurrentUser={setCurrentUser} setMessage={setMessage} />}
      />
      <Route
        path="/admin"
        element={
          <AdminDashboard
            videos={videos}
            title={title}
            setTitle={setTitle}
            file={file}
            setFile={setFile}
            message={message}
            setMessage={setMessage}
            progress={progress}
            isAdmin={isAdmin}
            adminKey={adminKey}
            setAdminKey={setAdminKey}
            handleAdminLogin={handleAdminLogin}
            handleAdminLogout={handleAdminLogout}
            handleUpload={handleUpload}
            deleteVideo={deleteVideo}
            fetchVideos={fetchVideos}
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
            page={page}
            totalPages={totalPages}
            changePage={changePage}
            setAuthMode={setAuthMode}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
