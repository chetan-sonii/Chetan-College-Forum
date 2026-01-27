import { Nav, Image } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Import hooks
import { useEffect } from "react";
import { getSpaces } from "../../redux/slices/topicSlice"; // Import action
import { IoGlobeOutline, IoPersonOutline, IoChatbubblesOutline } from "react-icons/io5";

const LeftSidebar = () => {
  const { user } = useSelector((state) => state.auth);
  // Get spaces and loading state from Redux
  const { spaces, getSpacesLoading } = useSelector((state) => state.topic);
  const dispatch = useDispatch();

  // Fetch spaces when component mounts
  useEffect(() => {
    // Only fetch if we haven't already (optional optimization) or just fetch every time
    if (!spaces || spaces.length === 0) {
      dispatch(getSpaces());
    }
  }, [dispatch, spaces?.length]);

  return (
      <div className="left-sidebar position-sticky" style={{ top: "80px" }}>
        <Nav className="flex-column gap-2">

          <Nav.Item>
            <NavLink to="/" end className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
              <IoGlobeOutline size={20} />
              <span>All Topics</span>
            </NavLink>
          </Nav.Item>

          {user?.username && (
              <Nav.Item>
                <NavLink to={`/user/${user.username}/topics`} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
                  <IoPersonOutline size={20} />
                  <span>My Topics</span>
                </NavLink>
              </Nav.Item>
          )}

          {user?.username && (
              <Nav.Item>
                <NavLink to={`/user/${user.username}/comments`} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}>
                  <IoChatbubblesOutline size={20} />
                  <span>My Answers</span>
                </NavLink>
              </Nav.Item>
          )}

          <hr className="my-3 text-secondary" />

          <div className="px-3 mb-2 text-uppercase text-muted" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
            Spaces
          </div>

          {/* Dynamic Spaces List */}
          {getSpacesLoading ? (
              <div className="px-3 text-muted">Loading spaces...</div>
          ) : (
              spaces?.map((space) => (
                  <Nav.Item key={space._id}>
                    <NavLink
                        to={`/space/${space.name}`}
                        className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}
                    >
                      {/* Show Space Avatar if available, else fallback icon */}
                      {space.avatar ? (
                          <Image
                              src={space.avatar}
                              roundedCircle
                              style={{ width: "20px", height: "20px", objectFit: "cover" }}
                          />
                      ) : (
                          <span style={{ width: "20px", textAlign: "center" }}>#</span>
                      )}
                      <span>{space.name}</span>
                    </NavLink>
                  </Nav.Item>
              ))
          )}

          {!getSpacesLoading && spaces?.length === 0 && (
              <div className="px-3 text-muted small">No spaces found.</div>
          )}

        </Nav>
      </div>
  );
};

export default LeftSidebar;