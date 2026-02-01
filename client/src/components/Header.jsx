import {
  Container,
  Navbar,
  Nav,
  Dropdown,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../redux/slices/topicSlice";
import { refresh_token, logout } from "../redux/slices/authSlice";
import Skeleton from "react-loading-skeleton";
import {
  BiSearch,
  BiUser,
  BiLogOut,
  BiChevronDown,
  BiPlus
} from "react-icons/bi";
import { RiShieldUserFill, RiFlashlightFill } from "react-icons/ri";

const Header = () => {
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isHeaderLoading } = useSelector((state) => state.auth);

  const isAuth = !!localStorage.getItem("isLoggedIn");

  // Scroll detection for "Floating" vs "Docked" state
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuth && !token) {
      dispatch(refresh_token());
    }
  }, [dispatch, isAuth, token]);

  const handleSubmitSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch(setSearchQuery(search));
      navigate("/");
    }
  };

  const hasUser = user && Object.keys(user).length > 0;

  return (
      <Navbar
          collapseOnSelect
          expand="lg"
          fixed="top"
          className={`modern-header ${scrolled ? "docked" : "floating"}`}
      >
        <Container fluid={scrolled} className={scrolled ? "px-4" : "container"}>
          {/* 1. BRAND LOGO */}
          <Navbar.Brand as={Link} to="/" onClick={() => dispatch(setSearchQuery(""))} className="brand-section me-5">
            <div className="logo-icon">
              <RiFlashlightFill />
            </div>
            <span className="logo-text">CHETAN</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="border-0 shadow-none" />

          <Navbar.Collapse id="responsive-navbar-nav">

            {/* 2. SEARCH BAR (Neumorphic Inset) */}
            <Nav className="flex-grow-1 justify-content-center my-3 my-lg-0">
              <Form className="modern-search-wrapper" onSubmit={(e) => e.preventDefault()}>
                <BiSearch className="search-icon-left" />
                <Form.Control
                    type="search"
                    placeholder="Search discussions..."
                    className="modern-search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSubmitSearch}
                />
                <span className="search-shortcut">/</span>
              </Form>
            </Nav>

            {/* 3. RIGHT SIDE ACTIONS */}
            <Nav className="align-items-center gap-3 ms-auto">

              {hasUser ? (
                  <>
                    <Link to="/topic/new" className="d-none d-lg-block">
                      <Button className="modern-create-btn">
                        <BiPlus size={20} /> <span>New Topic</span>
                      </Button>
                    </Link>

                    <Dropdown align="end">
                      <Dropdown.Toggle as="div" className="modern-profile-trigger">
                        <Image
                            src={user?.avatar?.url || "https://i.imgur.com/iV7Sdgm.jpg"}
                            className="modern-avatar"
                            alt="avatar"
                        />
                        <div className="d-none d-md-flex flex-column text-start ms-2">
                          <span className="fw-bold text-dark small lh-1">{user.firstName}</span>
                          <span className="text-muted small lh-1" style={{fontSize: '10px'}}>Online</span>
                        </div>
                        <BiChevronDown className="ms-2 text-muted" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="modern-dropdown shadow-lg">
                        <div className="px-3 py-2 border-bottom mb-2 bg-light rounded-top">
                          <p className="mb-0 fw-bold text-dark">{user.fullname}</p>
                          <small className="text-muted">@{user.username}</small>
                        </div>

                        <Dropdown.Item as={Link} to={`/user/${user.username}`} className="modern-drop-item">
                          <BiUser className="me-2" /> My Profile
                        </Dropdown.Item>

                        {user.role === 'admin' && (
                            <Dropdown.Item as={Link} to="/admin/dashboard" className="modern-drop-item">
                              <RiShieldUserFill className="me-2 text-primary" /> Admin Panel
                            </Dropdown.Item>
                        )}

                        <Dropdown.Divider />

                        <Dropdown.Item onClick={() => { dispatch(logout()); navigate("/"); }} className="modern-drop-item text-danger">
                          <BiLogOut className="me-2" /> Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
              ) : (isAuth && isHeaderLoading) ? (
                  <div className="d-flex align-items-center gap-2">
                    <Skeleton circle width={38} height={38} />
                    <Skeleton width={80} height={30} />
                  </div>
              ) : (
                  <div className="d-flex gap-2">
                    <Link to="/login">
                      <Button variant="link" className="text-decoration-none text-dark fw-bold">Log In</Button>
                    </Link>
                    <Link to="/register">
                      <Button className="btn-dark rounded-pill px-4">Sign Up</Button>
                    </Link>
                  </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Header;