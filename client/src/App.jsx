import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"; //
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Home from "./pages/Home";
import Topic from "./pages/Topic";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NewTopic from "./pages/NewTopic";
import TopicsTab from "./components/Profile/Tabs/TopicsTab";
import CommentsTab from "./components/Profile/Tabs/CommentsTab";
import FollowingTab from "./components/Profile/Tabs/FollowingTab";
import FollowersTab from "./components/Profile/Tabs/FollowersTab";
import UpvotedTab from "./components/Profile/Tabs/UpvotedTab";
import EmailVerify from "./pages/EmailVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import "react-loading-skeleton/dist/skeleton.css";
import "./App.css";
import "./poll.css";
import "./Responsive.css";
import { useSelector } from "react-redux";

// ✅ Admin Imports
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./components/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import UsersTable from "./pages/Admin/UsersTable";

// ✅ 1. Create a Layout for the Main Website (Includes Header)
const MainLayout = () => {
  return (
      <>
        <Header />
        <Outlet /> {/* This renders the child route (Home, Profile, etc.) */}
      </>
  );
};

const App = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const isAuth = localStorage.getItem("isLoggedIn") ? true : false;

  return (
      <Router>
        <Routes>
          {/* ====================================================
            ADMIN ROUTES (No Header, Separate Layout)
           ==================================================== */}

          {/* Admin Login Page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard */}
          {/* AdminLayout already handles the check for adminToken.
            If a regular user tries to go here, they will be redirected to Admin Login
            because they lack the admin token. */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersTable />} />
            {/* Add future admin tabs here (Users, Tags) */}
          </Route>


          {/* ====================================================
            MAIN WEBSITE ROUTES (Wrapped in MainLayout with Header)
           ==================================================== */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/space/:space" element={<Home />} />

            <Route
                path="/register"
                element={isAuth ? <Navigate replace to="/" /> : <Register />}
            />
            <Route
                path="/login"
                element={isAuth ? <Navigate replace to="/" /> : <Login />}
            />
            <Route
                path="/verify-email"
                element={isAuth ? <Navigate replace to="/" /> : <EmailVerify />}
            />
            <Route
                path="/forgot-password"
                element={isAuth ? <Navigate replace to="/" /> : <ForgotPassword />}
            />
            <Route
                path="/reset-password"
                element={isAuth ? <Navigate replace to="/" /> : <ResetPassword />}
            />

            <Route path="/topics/:id/:slug" element={<Topic />} />
            <Route
                path="/topic/new"
                element={!isAuth ? <Navigate replace to="/login" /> : <NewTopic />}
            />

            <Route path="/user/:username" element={<Profile />}>
              <Route index element={<TopicsTab />} /> {/* Default to Topics */}
              <Route path="topics" element={<TopicsTab />} />
              <Route path="upvoted" element={<UpvotedTab />} />
              <Route path="comments" element={<CommentsTab />} />
              <Route path="following" element={<FollowingTab />} />
              <Route path="followers" element={<FollowersTab />} />
            </Route>

            <Route
                path="/user/:username/edit"
                element={
                  !isAuth ? <Navigate replace to="/login" /> : <EditProfile />
                }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
  );
};

export default App;