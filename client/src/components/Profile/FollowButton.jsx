import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toggleUserFollow } from "../../redux/slices/profileSlice";
import { FaUserCheck } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const FollowButton = ({ passedUser }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector((state) => state.auth);

    // Safety check: Don't render if passedUser is missing
    if (!passedUser) return null;

    // Don't show follow button on your own card
    if (user?.username === passedUser?.username) {
        return null;
    }

    // ✅ CRITICAL FIX: Check using ID, handling both populated (object) and unpopulated (string) IDs
    const isFollowing = user?.following?.some((f) => {
        const id = typeof f === "string" ? f : f?._id;
        return id === passedUser?._id;
    });

    const handleFollow = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        dispatch(toggleUserFollow(passedUser?.username));
    };

    return (
        <Button
            onClick={handleFollow}
            className={`d-flex align-items-center gap-2 ${
                isFollowing ? "btn-secondary" : "btn-primary"
            }`}
            style={{ minWidth: "110px", justifyContent: "center" }}
        >
            {!isFollowing ? (
                <>
                    <IoPersonAdd /> Follow
                </>
            ) : (
                <>
                    <FaUserCheck /> Followed
                </>
            )}
        </Button>
    );
};

export default FollowButton;