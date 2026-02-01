import { Nav, Button, Image, Modal, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { BsFillTagFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { GiPlayButton } from "react-icons/gi";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdReportProblem } from "react-icons/md";
import moment from "moment";
import {
    deleteTopic,
    toggleDownvoteTopic,
    toggleUpvoteTopic,
    reportTopic,
} from "../../redux/slices/topicSlice";
import { toggleSaveTopic } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import PollItem from "./Poll/PollItem";
import { useState } from "react";

// ✅ Import DOMPurify
import DOMPurify from "dompurify";
// ✅ Import Quill Styles for proper rendering
import "react-quill/dist/quill.snow.css";

const DEFAULT_AVATAR = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const TopicContent = ({ topic, onDeleting }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const isAuth = !!localStorage.getItem("isLoggedIn");
    const { votingIsLoading, deleteTopicIsLoading } = useSelector((state) => state.topic);

    // Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const handleToggleUpvoteTopic = (id) => { dispatch(toggleUpvoteTopic(id)); };
    const handleToggleDownvoteTopic = (id) => { dispatch(toggleDownvoteTopic(id)); };

    const handleToggleSave = () => {
        if (!isAuth) return navigate("/login");
        dispatch(toggleSaveTopic(topic._id));
    };

    const isSaved = user?.savedTopics?.includes(topic._id);

    const handleSubmitReport = () => {
        if (!reportReason.trim()) return alert("Please provide a reason.");
        dispatch(reportTopic({ id: topic._id, reason: reportReason }));
        setShowReportModal(false);
        setReportReason("");
        alert("Report submitted for review.");
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
                    className={user?.username && topic?.upvotes?.includes(user?.username) ? "upvoted" : ""}
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
                    className={user?.username && topic?.downvotes?.includes(user?.username) ? "downvoted" : ""}
                >
                    <GiPlayButton />
                </Button>
            </div>

            <div className="topic-item-content">
                <div className="d-flex align-items-center justify-content-between">
                    <h4 className="topic-title">{topic?.title}</h4>

                    <Button
                        variant="link"
                        onClick={handleToggleSave}
                        className="text-decoration-none p-0 fs-4 text-secondary"
                        title={isSaved ? "Remove from Bookmarks" : "Save Topic"}
                    >
                        {isSaved ? <BsBookmarkFill className="text-primary" /> : <BsBookmark />}
                    </Button>
                </div>

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

                {/* ✅ FIX: RENDER HTML CONTENT SAFELY */}
                <div
                    className="topic-content-body mt-3 mb-4 ql-editor" // ql-editor class keeps spacing/lists correct
                    style={{ padding: 0 }} // Reset Quill padding
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(topic?.content)
                    }}
                />

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

                    {user?.username && topic?.author?.username === user?.username && (
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

                    <Nav.Link onClick={() => setShowReportModal(true)} className="d-flex align-items-center text-warning">
                        <MdReportProblem /> Report
                    </Nav.Link>
                </Nav>
            </div>

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