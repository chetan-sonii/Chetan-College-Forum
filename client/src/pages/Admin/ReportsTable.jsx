import { useEffect, useState } from "react";
import { Table, Button, Badge, Accordion, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminReports, dismissAdminReports, deleteAdminTopic } from "../../redux/slices/adminSlice";
import { MdCheckCircle, MdDelete, MdReportProblem, MdOpenInNew } from "react-icons/md";
import { Link } from "react-router-dom";
import moment from "moment";

const ReportsTable = () => {
    const dispatch = useDispatch();
    const { reportsList, reportsLoading } = useSelector((state) => state.admin);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => { dispatch(getAdminReports()); }, [dispatch]);

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const confirmDelete = () => {
        if (selectedItem) {
            dispatch(deleteAdminTopic(selectedItem._id));
            setShowModal(false);
        }
    };

    return (
        <div className="fade-in">
            <h3 className="fw-bold text-dark mb-4">Reported Content</h3>

            <div className="card border-0 shadow-sm">
                {reportsLoading ? (
                    <div className="text-center p-5">Loading reports...</div>
                ) : reportsList.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                        <MdCheckCircle size={40} className="text-success mb-3"/>
                        <h5>All Clear!</h5>
                        <p>No pending reports to review.</p>
                    </div>
                ) : (
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                        <tr>
                            <th className="ps-4 py-3 border-0">Reported Topic</th>
                            <th className="py-3 border-0">Author</th>
                            <th className="py-3 border-0">Report Count</th>
                            <th className="py-3 border-0 text-end pe-4">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reportsList.map(topic => (
                            <tr key={topic._id}>
                                <td className="ps-4" style={{ maxWidth: "300px" }}>
                                    <div className="fw-bold text-dark mb-1">{topic.title}</div>
                                    <Accordion flush>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header className="p-0 small-accordion-header">
                                                <small className="text-danger"><MdReportProblem /> View Reasons ({topic.reports.length})</small>
                                            </Accordion.Header>
                                            <Accordion.Body className="bg-light p-2 small">
                                                {topic.reports.map((r, idx) => (
                                                    <div key={idx} className="mb-1 border-bottom pb-1">
                                                        <strong>@{r.reporter?.username || "Unknown"}:</strong> {r.reason}
                                                    </div>
                                                ))}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </td>
                                <td>@{topic.author?.username || "Unknown"}</td>
                                <td><Badge bg="danger">{topic.reports.length}</Badge></td>
                                <td className="text-end pe-4">
                                    <Button
                                        as={Link}
                                        to={`/topics/${topic._id}/${topic.slug}`}
                                        target="_blank"
                                        variant="light" size="sm" className="text-primary me-2" title="View Topic"
                                    >
                                        <MdOpenInNew size={18} />
                                    </Button>

                                    <Button
                                        variant="light" size="sm" className="text-success me-2"
                                        title="Dismiss Reports (Keep Content)"
                                        onClick={() => dispatch(dismissAdminReports(topic._id))}
                                    >
                                        <MdCheckCircle size={18} />
                                    </Button>

                                    <Button
                                        variant="light" size="sm" className="text-danger"
                                        title="Delete Content"
                                        onClick={() => handleDeleteClick(topic)}
                                    >
                                        <MdDelete size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Delete Topic?</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>"{selectedItem?.title}"</strong>?</p>
                    <p className="text-danger small">This will remove the topic and all its comments permanently.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete Permanently</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportsTable;