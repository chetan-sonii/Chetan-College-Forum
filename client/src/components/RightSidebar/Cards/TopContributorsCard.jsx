import { useEffect } from "react";
import { Nav, Image } from "react-bootstrap";
import { FaUserEdit } from "react-icons/fa";
import { RiBallPenFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { getTopContributors } from "../../../redux/slices/topicSlice";
import { Link } from "react-router-dom";
import SkeletonCard from "../../Skeletons/SkeletonCard";

const TopContributorsCard = () => {
  const { topContributors, topContributorsIsLoading } = useSelector(
      (state) => state.topic
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTopContributors());
  }, [dispatch]);

  // ✅ FIX: Removed useMemo, return JSX directly
  return (
      <div className="card mb-3">
        <div className="card-header bg-white border-0 pb-0">
          <h6 className="d-flex align-items-center gap-2 mb-1">
            <FaUserEdit className="text-primary" />
            Top Contributors
          </h6>
          <small className="text-muted" style={{ fontSize: "0.8rem" }}>
            People who started the most topics.
          </small>
        </div>

        <Nav className="flex-column p-3 pt-2">
          {topContributorsIsLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
          )}

          {!topContributorsIsLoading &&
              topContributors?.length > 0 &&
              topContributors.map((user, idx) => (
                  <Link
                      key={idx}
                      className="nav-link d-flex align-items-center gap-3 px-0 py-2 text-dark"
                      to={`/user/${user?.author?.username}`}
                  >
                    <Image
                        src={user?.author?.avatar?.url}
                        roundedCircle
                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                    <div className="d-flex flex-column" style={{ flex: 1, minWidth: 0 }}>
                <span className="fw-semibold text-truncate">
                  {user?.author?.firstName} {user?.author?.lastName}
                </span>
                      <span className="text-muted small">@{user?.author?.username}</span>
                    </div>
                    <span className="badge bg-light text-primary d-flex align-items-center gap-1">
                <RiBallPenFill /> {user?.count}
              </span>
                  </Link>
              ))}
        </Nav>
      </div>
  );
};

export default TopContributorsCard;