import { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup, Badge, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminUsers, manageUser } from "../../redux/slices/adminSlice";
import { MdSearch, MdDelete, MdBlock, MdCheckCircle } from "react-icons/md";
import moment from "moment";

const UsersTable = () => {
    const dispatch = useDispatch();
    const { usersList, usersLoading } = useSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(""); // 'ban', 'delete'

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            dispatch(getAdminUsers(searchTerm));
        }, 500); // Debounce search request

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, dispatch]);

    const handleActionClick = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setShowModal(true);
    };

    const confirmAction = () => {
        if (selectedUser && actionType) {
            dispatch(manageUser({ id: selectedUser._id, action: actionType }));
            setShowModal(false);
        }
    };

    return (
        <div className="admin-users-page fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">User Management</h3>
                <InputGroup style={{ width: "300px" }}>
                    <InputGroup.Text className="bg-white border-end-0">
                        <MdSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search users..."
                        className="border-start-0 ps-0 shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>

            <div className="card border-0 shadow-sm">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                    <tr>
                        <th className="ps-4 py-3 border-0">User</th>
                        <th className="py-3 border-0">Email</th>
                        <th className="py-3 border-0">Joined</th>
                        <th className="py-3 border-0">Status</th>
                        <th className="py-3 border-0 text-end pe-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usersLoading ? (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <Spinner animation="border" size="sm" /> Loading users...
                            </td>
                        </tr>
                    ) : usersList.length > 0 ? (
                        usersList.map((user) => (
                            <tr key={user._id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={user.avatar?.url || "https://i.imgur.com/iV7Sdgm.jpg"}
                                            alt=""
                                            className="rounded-circle me-3"
                                            width="35" height="35"
                                            style={{ objectFit: "cover" }}
                                        />
                                        <div>
                                            <div className="fw-bold text-dark">@{user.username}</div>
                                            <div className="text-muted small">{user.firstName} {user.lastName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-muted">{user.email}</td>
                                <td className="text-muted">{moment(user.createdAt).format("MMM D, YYYY")}</td>
                                <td>
                                    {user.isBanned ? (
                                        <Badge bg="danger">Banned</Badge>
                                    ) : (
                                        <Badge bg="success" className="bg-opacity-10 text-success">Active</Badge>
                                    )}
                                </td>
                                <td className="text-end pe-4">
                                    {user.isBanned ? (
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="text-success me-2"
                                            onClick={() => handleActionClick(user, "unban")}
                                            title="Unban User"
                                        >
                                            <MdCheckCircle size={18} />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="text-warning me-2"
                                            onClick={() => handleActionClick(user, "ban")}
                                            title="Ban User"
                                        >
                                            <MdBlock size={18} />
                                        </Button>
                                    )}

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="text-danger"
                                        onClick={() => handleActionClick(user, "delete")}
                                        title="Delete User"
                                    >
                                        <MdDelete size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5 text-muted">
                                No users found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <strong>{actionType}</strong> user <strong>@{selectedUser?.username}</strong>?
                    {actionType === "delete" && (
                        <p className="text-danger mt-2 small">This action is permanent and cannot be undone.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button
                        variant={actionType === "delete" ? "danger" : "warning"}
                        onClick={confirmAction}
                    >
                        Confirm {actionType === "delete" ? "Delete" : "Ban"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsersTable;