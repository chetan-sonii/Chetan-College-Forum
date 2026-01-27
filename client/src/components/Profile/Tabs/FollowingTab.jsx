import { Col, Row, Image } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserFollowing } from "../../../redux/slices/profileSlice";
import { useEffect } from "react";
import FollowButton from "../FollowButton";
import SkeletonFollowTab from "../../Skeletons/SkeletonFollowTab";

const FollowingTab = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { userFollowing, followIsLoading } = useSelector(
      (state) => state.profile
  );

  // ✅ FIX: Use useEffect instead of useMemo for side effects
  useEffect(() => {
    dispatch(getUserFollowing(username));
  }, [dispatch, username]);

  return (
      <Row className="profile-info">
        <Col>
          <div className="tab-ui">
            <h6 className="tab-title">Following</h6>
            <Row>
              {followIsLoading && <SkeletonFollowTab />}
              {!followIsLoading &&
                  userFollowing.length > 0 &&
                  userFollowing.map((user) => (
                      <Col key={user?._id} lg={12}>
                        <div className="follow-brief d-flex align-items-center">
                          <Image src={user?.avatar?.url} />
                          <div className="user-meta d-flex flex-column">
                            <h5 className="user-name">
                              {user?.firstName} {user?.lastName}
                            </h5>
                            <span className="username">@{user?.username}</span>
                            <span className="user-bio">{user?.bio}</span>
                          </div>
                          <FollowButton passedUser={user} />
                        </div>
                      </Col>
                  ))}
              {!followIsLoading && userFollowing.length === 0 && (
                  <p className="text-muted p-3">Not following anyone yet.</p>
              )}
            </Row>
          </div>
        </Col>
      </Row>
  );
};

export default FollowingTab;