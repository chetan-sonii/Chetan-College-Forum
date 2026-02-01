import { useEffect } from "react";
import { Row, Col, Card, Table, Spinner, Alert, ProgressBar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminStats } from "../../redux/slices/adminSlice";
import { MdPeople, MdTopic, MdComment, MdTag, MdTrendingUp, MdPieChart } from "react-icons/md";
import moment from "moment";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, isLoading, error } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(getAdminStats());
    }, [dispatch]);

    if (isLoading) return <div className="d-flex justify-content-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    const { counts, recentUsers, charts } = stats || {};
    const { totalUsers, totalTopics, totalComments, totalTags } = counts || {};
    const { growthData, topicsPerSpace } = charts || {};

    // Colors for Pie Chart
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

    // Reusable Stat Card
    const StatCard = ({ title, count, icon, color, bg }) => (
        <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Body className="position-relative">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-muted text-uppercase fw-bold small mb-1">{title}</p>
                        <h3 className="fw-bold mb-0">{count}</h3>
                    </div>
                    <div className={`p-3 rounded-circle text-white shadow-sm`} style={{ backgroundColor: color }}>
                        {icon}
                    </div>
                </div>
                <div className="mt-4">
                    <ProgressBar now={70} variant={bg} style={{ height: "4px" }} />
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <div className="admin-dashboard fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Dashboard Overview</h3>
                    <p className="text-muted small">Welcome back, Admin</p>
                </div>
            </div>

            {/* 1. Statistics Row */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <StatCard title="Total Users" count={totalUsers} icon={<MdPeople size={24} />} color="#4e73df" bg="primary" />
                </Col>
                <Col md={3}>
                    <StatCard title="Total Topics" count={totalTopics} icon={<MdTopic size={24} />} color="#1cc88a" bg="success" />
                </Col>
                <Col md={3}>
                    <StatCard title="Total Comments" count={totalComments} icon={<MdComment size={24} />} color="#f6c23e" bg="warning" />
                </Col>
                <Col md={3}>
                    <StatCard title="Tags Created" count={totalTags} icon={<MdTag size={24} />} color="#36b9cc" bg="info" />
                </Col>
            </Row>

            {/* 2. Charts Row */}
            <Row className="g-4 mb-4">
                {/* Line Chart: Activity Growth */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 py-3 d-flex align-items-center justify-content-between">
                            <h6 className="m-0 fw-bold text-primary"><MdTrendingUp className="me-2" /> Platform Growth (30 Days)</h6>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={growthData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4e73df" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4e73df" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorTopics" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1cc88a" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#1cc88a" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(str) => moment(str).format('MMM D')} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelFormatter={(label) => moment(label).format('MMMM Do, YYYY')}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="users" name="New Users" stroke="#4e73df" fillOpacity={1} fill="url(#colorUsers)" />
                                        <Area type="monotone" dataKey="topics" name="New Topics" stroke="#1cc88a" fillOpacity={1} fill="url(#colorTopics)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Pie Chart: Topic Distribution */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 py-3">
                            <h6 className="m-0 fw-bold text-dark"><MdPieChart className="me-2" /> Popular Spaces</h6>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={topicsPerSpace}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {topicsPerSpace?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 3. Recent Users Table */}
            <Row>
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-bottom">
                            <h6 className="m-0 fw-bold text-dark">Recently Joined Users</h6>
                        </Card.Header>
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0">User</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Join Date</th>
                                <th className="border-0">Role</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentUsers?.map((user) => (
                                <tr key={user._id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 35, height: 35}}>
                                                {user.avatar?.url ? <img src={user.avatar.url} className="rounded-circle w-100 h-100" alt="" /> : <MdPeople />}
                                            </div>
                                            <span className="fw-semibold text-dark">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted small">{user.email}</td>
                                    <td className="text-muted small">{moment(user.createdAt).fromNow()}</td>
                                    <td><span className="badge bg-primary bg-opacity-10 text-primary">User</span></td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;