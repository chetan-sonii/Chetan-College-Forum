import { Nav, Button, Image, Modal, Form } from "react-bootstrap"; // ✅ Added Modal, Form
import { Link, useNavigate } from "react-router-dom";
import { BsFillTagFill } from "react-icons/bs";
import { GiPlayButton } from "react-icons/gi";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdReportProblem } from "react-icons/md"; // ✅ Added Report Icon
import moment from "moment";
import {
    deleteTopic,
    toggleDownvoteTopic,
    toggleUpvoteTopic,
    reportTopic, // ✅ Make sure this action is imported
} from "../../redux/slices/topicSlice";
import { useDispatch, useSelector } from "react-redux";
import PollItem from "./Poll/PollItem";
import { useState } from "react"; // ✅ Added useState

const DEFAULT_AVATAR = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const TopicContent = ({ topic, onDeleting }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const username = JSON.parse(localStorage.getItem("user"))?.username;
    const isAuth = !!localStorage.getItem("isLoggedIn");
    const { votingIsLoading, deleteTopicIsLoading } = useSelector((state) => state.topic);

    // ✅ Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const handleToggleUpvoteTopic = (id) => { dispatch(toggleUpvoteTopic(id)); };
    const handleToggleDownvoteTopic = (id) => { dispatch(toggleDownvoteTopic(id)); };

    // ✅ Handle Report Submission
    const handleSubmitReport = () => {
        if (!reportReason.trim()) return alert("Please provide a reason.");
        dispatch(reportTopic({ id: topic._id, reason: reportReason }));
        setShowReportModal(false);
        setReportReason("");
        alert("Report submitted for review.");
    };

    const handleOpenReport = () => {
        if (!isAuth) return navigate("/login");
        setShowReportModal(true);
    };

    return (
        <>
            <div className="topic-vote d-flex flex-column align-items-center">
                <Button
                    disabled={votingIsLoading}
                    onClick={() => {
                        if (!isAuth) navigate("/login");
                        if (isAuth) handleToggleUpvoteTopic(topic?._id);
                    }}
                    className={username && topic?.upvotes?.includes(username) ? "upvoted" : ""}
                >
                    <GiPlayButton />
                </Button>
                <span className="votes">
             {topic?.upvotes?.length - topic?.downvotes?.length}
          </span>
                <Button
                    disabled={votingIsLoading}
                    onClick={() => {
                        if (!isAuth) navigate("/login");
                        if (isAuth) handleToggleDownvoteTopic(topic?._id);
                    }}
                    className={username && topic?.downvotes?.includes(username) ? "downvoted" : ""}
                >
                    <GiPlayButton />
                </Button>
            </div>

            <div className="topic-item-content">
                <h4 className="topic-title">{topic?.title}</h4>
                <div className="topic-meta d-flex align-items-center">
                    <div className="topic-writer d-flex align-items-center">
                        <Link className="d-flex align-items-center justify-content-center" to={`/user/${topic?.author?.username}`}>
                            <Image
                                src={topic?.author?.avatar?.url || DEFAULT_AVATAR}
                                onError={(e) => e.target.src = DEFAULT_AVATAR}
                            />
                            <h5 className="writer">
                                {topic?.author ? `${topic.author.firstName} ${topic.author.lastName}` : "Unknown User"}
                            </h5>
                        </Link>
                        <p className="topic-date">
                            Posted {moment(topic?.createdAt).fromNow()}
                        </p>
                    </div>
                </div>

                <p className="topic-summary">{topic?.content}</p>

                {topic?.poll && topic.poll.question && (
                    <div className="mb-4">
                        <PollItem poll={topic.poll} topicId={topic._id} />
                    </div>
                )}

                <div className="tags-container d-flex align-items-center">
                    <span className="d-flex align-items-center"><BsFillTagFill /> tags:</span>
                    <Nav as="ul" className="tags">
                        {topic?.tags?.map((tag, i) => (
                            <Nav.Item key={i} as="li"><Nav.Link>{tag?.name}</Nav.Link></Nav.Item>
                        ))}
                    </Nav>
                </div>

                <Nav className="thread-actions d-flex align-items-center">
                    <Nav.Link style={{ pointerEvents: "none" }} className="d-flex align-items-center">
                        <FaEye /> {topic?.viewsCount} views
                    </Nav.Link>

                    {username && topic?.author?.username === username && (
                        <Nav.Link
                            disabled={deleteTopicIsLoading}
                            onClick={() => {
                                if (isAuth) {
                                    dispatch(deleteTopic(topic?._id));
                                    onDeleting();
                                }
                            }}
                            className="d-flex align-items-center text-danger"
                        >
                            <MdDelete /> delete this topic
                        </Nav.Link>
                    )}

                    {/* ✅ Report Button */}
                    <Nav.Link onClick={handleOpenReport} className="d-flex align-items-center text-warning">
                        <MdReportProblem /> Report
                    </Nav.Link>
                </Nav>
            </div>

            {/* ✅ Report Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Report Topic</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Why are you reporting this?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Spam, harassment, inappropriate content..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleSubmitReport}>
                        Submit Report
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TopicContent;