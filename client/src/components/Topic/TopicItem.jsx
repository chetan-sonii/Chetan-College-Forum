import { Button, Nav, Image } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GiPlayButton } from "react-icons/gi";
import { SiGooglemessages } from "react-icons/si";
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toggleUpvoteTopic, toggleDownvoteTopic } from "../../redux/slices/topicSlice";
import moment from "moment";
import PollItem from "./Poll/PollItem";
import DOMPurify from "dompurify"; // ✅ Import DOMPurify

const DEFAULT_AVATAR = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const TopicItem = ({ topic }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { space } = useParams();

    const { user } = useSelector((state) => state.auth); // Use Redux user for consistency
    const isAuth = !!localStorage.getItem("isLoggedIn");
    const { votingIsLoading } = useSelector((state) => state.topic);

    const handleToggleUpvoteTopic = (id) => { dispatch(toggleUpvoteTopic(id)); };
    const handleToggleDownvoteTopic = (id) => { dispatch(toggleDownvoteTopic(id)); };

    // ✅ Helper to Strip Tags
    const getPreviewText = (htmlContent) => {
        if (!htmlContent) return "";
        const cleanHTML = DOMPurify.sanitize(htmlContent);
        const doc = new DOMParser().parseFromString(cleanHTML, "text/html");
        return doc.body.textContent || "";
    };

    return (
        <article className="topic-item">
            <div className="topic-vote d-flex flex-column align-items-center">
                <Button
                    disabled={votingIsLoading}
                    onClick={() => {
                        if (!isAuth) navigate("/login");
                        if (isAuth) handleToggleUpvoteTopic(topic._id);
                    }}
                    className={user?.username && topic?.upvotes?.includes(user?.username) ? "upvoted" : ""}
                >
                    <GiPlayButton />
                </Button>
                <span className={`votes ${user?.username && topic?.upvotes?.includes(user?.username) ? "upvoted" : ""} ${user?.username && topic?.downvotes?.includes(user?.username) ? "downvoted" : ""}`}>
            {topic?.upvotes?.length - topic?.downvotes?.length}
          </span>
                <Button
                    disabled={votingIsLoading}
                    onClick={() => {
                        if (!isAuth) navigate("/login");
                        if (isAuth) handleToggleDownvoteTopic(topic._id);
                    }}
                    className={user?.username && topic?.downvotes?.includes(user?.username) ? "downvoted" : ""}
                >
                    <GiPlayButton />
                </Button>
            </div>
            <div className="topic-item-content">
                <Nav as="ul" className="tags">
                    {topic?.tags?.length > 0 &&
                        topic?.tags?.map((tag, i) => (
                            <Nav.Item key={i} as="li">
                                <Nav.Link
                                    as={Link}
                                    to={space ? `/space/${space}?tag=${tag?.name}` : `/?tag=${tag?.name}`}
                                >
                                    {tag?.name}
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                </Nav>
                <Link to={`/topics/${topic?._id}/${topic?.slug}`}>
                    <h4 className="topic-title">{topic?.title}</h4>
                </Link>

                {/* ✅ FIX: Display Plain Text Preview */}
                <p className="topic-summary">
                    {getPreviewText(topic?.content).substring(0, 150)}
                    {getPreviewText(topic?.content).length > 150 && "..."}
                </p>

                {topic.poll && topic.poll.question && (
                    <PollItem poll={topic.poll} topicId={topic._id} />
                )}

                <div className="topic-meta d-flex align-items-center">
                    <div className="topic-writer d-flex align-items-center">
                        <Link className="d-flex align-items-center justify-content-center" to={`/user/${topic?.author?.username}`}>
                            <Image
                                src={topic?.author?.avatar?.url || DEFAULT_AVATAR}
                                onError={(e) => e.target.src = DEFAULT_AVATAR}
                            />
                            <h5 className="writer">
                                {topic?.author ? `${topic?.author?.firstName} ${topic?.author?.lastName}` : "Unknown User"}
                            </h5>
                        </Link>
                        <p className="topic-date">
                            Posted {moment.utc(topic?.createdAt).local().startOf("seconds").fromNow()}
                        </p>
                    </div>
                    <div className="topic-stats d-flex">
              <span className="answers d-flex align-items-center">
                <div className="icon-container d-flex"><SiGooglemessages /></div>
                  {topic?.totalComments || 0}
              </span>
                        <span className="views d-flex align-items-center">
                <div className="icon-container d-flex"><FaEye /></div>
                            {topic?.viewsCount || 0}
              </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default TopicItem;