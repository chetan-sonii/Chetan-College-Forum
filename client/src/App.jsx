import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
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
import axios from "./utils/axios";


// ✅ Admin Imports
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./components/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import UsersTable from "./pages/Admin/UsersTable";
import TagsTable from "./pages/Admin/TagsTable";
import CommentsTable from "./pages/Admin/CommentsTable";
import ReportsTable from "./pages/Admin/ReportsTable";

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
  const isAuth = !!localStorage.getItem("isLoggedIn");

  // ✅ FIX: useEffect moved INSIDE the component
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      // Restore the token to Axios headers so requests don't fail
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
    }
  }, []);

  return (
      <Router>
        <Routes>
          {/* ====================================================
            ADMIN ROUTES (No Header, Separate Layout)
           ==================================================== */}

          {/* Admin Login Page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="tags" element={<TagsTable />} />
            <Route path="comments" element={<CommentsTable />} />
            <Route path="reports" element={<ReportsTable />} />
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
              {/* Note: Ensure 'saved' route is added here if you implemented SavedTab */}
              {/* <Route path="saved" element={<SavedTab />} /> */}
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