import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import SpacesCard from "./Cards/SpacesCard"; // Ensure you use this or fetch spaces here
import { IomdGlobe, IomdPerson, IomdChatbubbles } from "react-icons/io";

const LeftSidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
      <aside className="left-sidebar">
        <Nav className="flex-column gap-2">

          {/* 1. All Topics */}
          <Nav.Item>
            <NavLink to="/" className="nav-link d-flex align-items-center gap-2">
              <IomdGlobe size={20} />
              All Topics
            </NavLink>
          </Nav.Item>

          {/* 2. My Topics (Only if logged in) */}
          {user?.username && (
              <Nav.Item>
                {/* Links to Profile -> Default Tab (Topics) */}
                <NavLink to={`/user/${user.username}`} end className="nav-link d-flex align-items-center gap-2">
                  <IomdPerson size={20} />
                  My Topics
                </NavLink>
              </Nav.Item>
          )}

          {/* 3. My Answers (Only if logged in) */}
          {user?.username && (
              <Nav.Item>
                {/* Links to Profile -> Comments Tab */}
                <NavLink to={`/user/${user.username}/comments`} className="nav-link d-flex align-items-center gap-2">
                  <IomdChatbubbles size={20} />
                  My Answers
                </NavLink>
              </Nav.Item>
          )}

          <hr />

          {/* 4. Spaces */}
          <div className="spaces-section">
            <h6 className="text-muted px-3 mb-2">Spaces</h6>
            {/* You can reuse your SpacesCard or map links directly here */}
            {/* Example of linking a space: */}
            <NavLink to="/space/technology" className="nav-link">
              Technology
            </NavLink>
            <NavLink to="/space/music" className="nav-link">
              Music
            </NavLink>
            {/* ... map your spaces array ... */}
          </div>

        </Nav>
      </aside>
  );
};

export default LeftSidebar;