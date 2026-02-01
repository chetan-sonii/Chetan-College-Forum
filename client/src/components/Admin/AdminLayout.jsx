import { Outlet, Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Nav, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../redux/slices/adminSlice";
import { MdDashboard, MdPeople, MdTag, MdLogout } from "react-icons/md";

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(adminLogout());
        navigate("/admin/login");
    };

    return (
        <Container fluid>
            <Row>
                {/* Admin Sidebar */}
                <Col md={2} className="bg-dark min-vh-100 p-3 text-white">
                    <h5 className="mb-4 text-danger fw-bold ps-2">ADMIN PANEL</h5>
                    <Nav className="flex-column gap-2">
                        <Nav.Link as={Link} to="/admin/dashboard" className="text-white-50 hover-white">
                            <MdDashboard className="me-2" /> Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/users" className="text-white-50 hover-white">
                            <MdPeople className="me-2" /> Users
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/tags" className="text-white-50 hover-white">
                            <MdTag className="me-2" /> Tags
                        </Nav.Link>
                    </Nav>

                    <hr className="border-secondary my-4"/>

                    <Button variant="outline-danger" size="sm" className="w-100" onClick={handleLogout}>
                        <MdLogout className="me-2" /> Logout
                    </Button>
                </Col>

                {/* Main Content Area */}
                <Col md={10} className="p-4 bg-light">
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout;