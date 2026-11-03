import {BrowserRouter,Routes,Route,Navigate,useNavigate} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from "./components/ProtectedRoute";

import LogoutButton from "./components/LogoutButton";
import AdminUsers from "./pages/AdminUsers";
import Profile from "./pages/Profile";
import "./css/Dashboard.css";

function Home() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">

        <div className="dashboard-icon">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="dashboard-profile-image"
          />
        </div>

        <h1>Welcome Back!</h1>

        <p className="dashboard-subtitle">
          Welcome to your personal dashboard.
        </p>

        {user && (
          <div className="welcome-message">
            Hello, <span>{user.name}!</span>
          </div>
        )}

        <p className="dashboard-description">
          Manage your profile and keep your account information up to date.
        </p>

        <div className="dashboard-actions">
          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>

          <LogoutButton />
        </div>

      </div>
    </div>
  );
}

function Admin() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">

        <div className="dashboard-icon">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="dashboard-profile-image"
          />
        </div>

        <h1>Admin Dashboard</h1>

        <p className="dashboard-subtitle">
          Manage your application and users.
        </p>

        {user && (
          <div className="welcome-message">
            Hello, <span>{user.name}!</span>
          </div>
        )}

        <p className="dashboard-description">
          You can manage registered users, update profiles and control user access.
        </p>

        <div className="dashboard-actions">

          <button
            className="manage-users-btn"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>

          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>

          <LogoutButton />

        </div>

      </div>
    </div>
  );
}

function App(){
  return (
    <BrowserRouter>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme='colored'
      />
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />}/>
        
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Route only accessible to users */}
        <Route element={<ProtectedRoute allowedRole="user"/>}>
          <Route path='/home' element={<Home/>} />
        </Route>

        {/* Route only accessible to admin */}
        <Route element={<ProtectedRoute allowedRole="admin"/>}> 
          <Route path='/admin' element={<Admin/>} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route> 
         
      </Routes>
    </BrowserRouter>
  )
}

export default App;