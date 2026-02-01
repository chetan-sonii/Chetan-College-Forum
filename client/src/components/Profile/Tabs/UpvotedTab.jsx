import { useEffect } from "react";
import { Row, Col, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
// ✅ Import the new action from profileSlice
import { getUserUpvotedTopics } from "../../../redux/slices/profileSlice";
import TopicItem from "../../Topic/TopicItem";
import SkeletonTopicItem from "../../Skeletons/SkeletonTopicItem";
import { FaThumbsUp } from "react-icons/fa";

const UpvotedTab = () => {
  const { username } = useParams();
  const dispatch = useDispatch();

  // ✅ Select from profile state, not topic state
  const { userUpvotedTopics, upvotedTopicsLoading } = useSelector((state) => state.profile);

  useEffect(() => {
    if (username) {
      dispatch(getUserUpvotedTopics(username));
    }
  }, [dispatch, username]);

  return (
      <Row className="profile-info">
        <Col>
          <div className="tab-ui">
            <h6 className="tab-title">Upvoted Topics</h6>
            <div className="feed">
              {upvotedTopicsLoading ? (
                  <>
                    <SkeletonTopicItem />
                    <SkeletonTopicItem />
                  </>
              ) : (
                  <>
                    {userUpvotedTopics?.length > 0 ? (
                        userUpvotedTopics.map((topic) => (
                            <TopicItem key={topic._id} topic={topic} />
                        ))
                    ) : (
                        <Alert variant="light" className="text-center p-4 border-0">
                          <FaThumbsUp size={30} className="text-muted mb-3" />
                          <p className="text-muted">
                            @{username} hasn't upvoted any topics yet.
                          </p>
                        </Alert>
                    )}
                  </>
              )}
            </div>
          </div>
        </Col>
      </Row>
  );
};

export default UpvotedTab;