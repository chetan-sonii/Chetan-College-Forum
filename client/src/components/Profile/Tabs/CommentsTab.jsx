import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserComments } from "../../../redux/slices/profileSlice";
import { useEffect } from "react";
import SkeletonCommentsTab from "../../Skeletons/SkeletonCommentsTab";
import CommentItem from "../../Comment/CommentItem"; // Reuse your comment item or a specific profile version

const CommentsTab = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { userComments, commentsIsLoading } = useSelector(
      (state) => state.profile
  );

  // ✅ FIX: Use useEffect
  useEffect(() => {
    dispatch(getUserComments(username));
  }, [dispatch, username]);

  return (
      <Row className="profile-info">
        <Col>
          <div className="tab-ui">
            <h6 className="tab-title">Comments</h6>
            <div className="feed">
              {commentsIsLoading && (
                  <>
                    <SkeletonCommentsTab />
                    <SkeletonCommentsTab />
                  </>
              )}

              {!commentsIsLoading && userComments?.length > 0 && (
                  // Assuming CommentItem can handle a list, or map them here:
                  userComments.map(comment => (
                      <div key={comment._id} className="comment-preview-card p-3 mb-2 border rounded bg-white">
                        <small className="text-muted">Replied to: <strong>{comment.parentTopic?.title || "Topic"}</strong></small>
                        <p className="mt-2 mb-0">{comment.content}</p>
                      </div>
                  ))
              )}

              {!commentsIsLoading && userComments?.length === 0 && (
                  <p className="text-muted p-3">No comments made yet.</p>
              )}
            </div>
          </div>
        </Col>
      </Row>
  );
};

export default CommentsTab;