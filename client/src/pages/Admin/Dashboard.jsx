import { useEffect } from "react";
import { Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminStats } from "../../redux/slices/adminSlice";
import { MdPeople, MdTopic, MdComment, MdTag } from "react-icons/md";
import moment from "moment";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, isLoading, error } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(getAdminStats());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">Error loading stats: {error}</Alert>;
    }

    // Destructure data safely
    const { counts, recentUsers } = stats || {};
    const { totalUsers = 0, totalTopics = 0, totalComments = 0, totalTags = 0 } = counts || {};

    // Reusable Stat Card Component
    const StatCard = ({ title, count, icon, color }) => (
        <Card className={`border-0 shadow-sm mb-4 border-start border-4 border-${color}`}>
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                        {title}
                    </h6>
                    <h2 className="mb-0 fw-bold">{count}</h2>
                </div>
                <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle text-${color} d-flex align-items-center justify-content-center`} style={{ width: "60px", height: "60px" }}>
                    {icon}
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <div>
            <h3 className="fw-bold mb-4 text-dark">Dashboard Overview</h3>

            {/* 1. Statistics Cards */}
            <Row>
                <Col md={6} xl={3}>
                    <StatCard title="Total Users" count={totalUsers} icon={<MdPeople size={28} />} color="primary" />
                </Col>
                <Col md={6} xl={3}>
                    <StatCard title="Total Topics" count={totalTopics} icon={<MdTopic size={28} />} color="success" />
                </Col>
                <Col md={6} xl={3}>
                    <StatCard title="Total Comments" count={totalComments} icon={<MdComment size={28} />} color="warning" />
                </Col>
                <Col md={6} xl={3}>
                    <StatCard title="Total Tags" count={totalTags} icon={<MdTag size={28} />} color="info" />
                </Col>
            </Row>

            {/* 2. Recent Registrations Table */}
            <Row className="mt-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold text-dark">Recent Registrations</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle text-nowrap">
                                <thead className="bg-light text-muted">
                                <tr>
                                    <th className="ps-4 py-3">User</th>
                                    <th className="py-3">Email</th>
                                    <th className="py-3">Joined Date</th>
                                    <th className="py-3">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentUsers?.map((user) => (
                                    <tr key={user._id}>
                                        <td className="ps-4 fw-bold text-primary">
                                            @{user.username}
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{moment(user.createdAt).format("MMM Do YYYY, h:mm a")}</td>
                                        <td>
                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                          Active
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentUsers || recentUsers.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">
                                            No recent users found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;