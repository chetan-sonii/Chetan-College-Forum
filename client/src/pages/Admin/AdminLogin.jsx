import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../redux/slices/adminSlice";
import { RiShieldUserFill } from "react-icons/ri";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { admin, isLoading, error } = useSelector((state) => state.admin);

    useEffect(() => {
        if (admin) navigate("/admin/dashboard");
    }, [admin, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(adminLogin({ username, password }));
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Card style={{ width: "400px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <RiShieldUserFill size={50} className="text-danger mb-2" />
                        <h4 className="fw-bold">Admin Portal</h4>
                        <p className="text-muted small">Restricted Access</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Admin Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="danger" type="submit" className="w-100" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Login to Dashboard"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminLogin;