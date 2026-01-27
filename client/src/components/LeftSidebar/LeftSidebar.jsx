import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoGlobeOutline, IoPersonOutline, IoChatbubblesOutline } from "react-icons/io5"; // Updated icons
// If you have a Spaces component/card, you can render it below

const LeftSidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
      <div className="left-sidebar position-sticky" style={{ top: "80px" }}>
        <Nav className="flex-column gap-2">

          {/* 1. All Topics */}
          <Nav.Item>
            <NavLink to="/" end className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
              <IoGlobeOutline size={20} />
              <span>All Topics</span>
            </NavLink>
          </Nav.Item>

          {/* 2. My Topics */}
          {user?.username && (
              <Nav.Item>
                <NavLink to={`/user/${user.username}/topics`} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
                  <IoPersonOutline size={20} />
                  <span>My Topics</span>
                </NavLink>
              </Nav.Item>
          )}

          {/* 3. My Answers */}
          {user?.username && (
              <Nav.Item>
                <NavLink to={`/user/${user.username}/comments`} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
                  <IoChatbubblesOutline size={20} />
                  <span>My Answers</span>
                </NavLink>
              </Nav.Item>
          )}

          <hr className="my-3 text-secondary" />

          {/* 4. Spaces Section */}
          <div className="px-3 mb-2 text-uppercase text-muted" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
            Spaces
          </div>

          {/* Hardcoded Spaces for now (Dynamic later via API if needed) */}
          <Nav.Item>
            <NavLink to="/space/technology" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Technology
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink to="/space/business" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Business
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink to="/space/music" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Music
            </NavLink>
          </Nav.Item>

        </Nav>
      </div>
  );
};

export default LeftSidebar;