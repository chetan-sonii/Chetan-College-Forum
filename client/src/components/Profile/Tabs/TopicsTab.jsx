import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserProfile } from "../../../redux/slices/profileSlice"; // Assuming you might need profile data, or specific topic fetch
import { useEffect } from "react";
import SkeletonTopicItem from "../../Skeletons/SkeletonTopicItem";
import TopicItem from "../../Topic/TopicItem";
// Make sure you have a thunk to get user topics.
// If it's inside profileSlice or topicSlice, import it here.
// Assuming it exists as 'getUserTopics' based on your previous code context:
import { getUserTopics } from "../../../redux/slices/topicSlice";

const TopicsTab = () => {
  const { username } = useParams();
  const dispatch = useDispatch();

  // Adjust selector based on where your user's topics are stored
  const { topics, isLoading } = useSelector((state) => state.topic);
  // OR if it's in profile: const { userTopics, profileIsLoading } = useSelector((state) => state.profile);

  // ✅ FIX 1: Use useEffect for data fetching
  useEffect(() => {
    dispatch(getUserTopics(username));
  }, [dispatch, username]);

  // ✅ FIX 2: Return JSX directly (No useMemo)
  return (
      <Row className="profile-info">
        <Col>
          <div className="tab-ui">
            <h6 className="tab-title">Topics</h6>
            <div className="feed">
              {isLoading && (
                  <>
                    <SkeletonTopicItem />
                    <SkeletonTopicItem />
                  </>
              )}

              {!isLoading && topics?.length > 0 && topics.map((topic) => (
                  <TopicItem key={topic._id} topic={topic} />
              ))}

              {!isLoading && topics?.length === 0 && (
                  <p className="text-muted p-3">This user hasn't posted any topics yet.</p>
              )}
            </div>
          </div>
        </Col>
      </Row>
  );
};

export default TopicsTab;