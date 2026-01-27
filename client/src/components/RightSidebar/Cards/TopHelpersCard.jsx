import { useEffect } from "react";
import { Image, Nav } from "react-bootstrap";
import { BsPersonLinesFill } from "react-icons/bs";
import { SiGooglemessages } from "react-icons/si";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTopHelpers } from "../../../redux/slices/commentSlice";
import SkeletonCard from "../../Skeletons/SkeletonCard";

const TopHelpersCard = () => {
  const { topHelpers, herlpersIsLoading } = useSelector(
      (state) => state.comment
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTopHelpers());
  }, [dispatch]);

  // ✅ FIX: Removed useMemo
  return (
      <div className="card mb-3">
        <div className="card-header bg-white border-0 pb-0">
          <h6 className="d-flex align-items-center gap-2 mb-1">
            <BsPersonLinesFill className="text-success" />
            Top Helpers
          </h6>
          <small className="text-muted" style={{ fontSize: "0.8rem" }}>
            People with the most answers.
          </small>
        </div>

        <Nav className="flex-column p-3 pt-2">
          {herlpersIsLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
          )}

          {!herlpersIsLoading &&
              topHelpers?.length > 0 &&
              topHelpers.map((user, idx) => (
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
                    <span className="badge bg-light text-success d-flex align-items-center gap-1">
                <SiGooglemessages /> {user?.count}
              </span>
                  </Link>
              ))}
        </Nav>
      </div>
  );
};

export default TopHelpersCard;