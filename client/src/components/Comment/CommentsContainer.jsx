import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTopicComments, addRealTimeComment } from "../../redux/slices/commentSlice";
import CommentItem from "./CommentItem";
import SkeletonComments from "../Skeletons/SkeletonComments";
import { io } from "socket.io-client";

const CommentsContainer = ({ topic }) => {
  const { comments, getTopicCommentsState } = useSelector(
      (state) => state.comment
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (topic?._id) {
      const id = topic?._id;
      dispatch(getTopicComments(id));
    }
  }, [dispatch, topic?._id]);

  // --- Socket.io Integration ---
  useEffect(() => {
    if (!topic?._id) return;

    // Connect to your backend
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    // Join the specific room for this topic
    socket.emit("join_topic", topic._id);

    // Listen for incoming comments
    socket.on("receive_comment", (newComment) => {
      dispatch(addRealTimeComment(newComment));
    });

    // Cleanup connection when component unmounts or topic changes
    return () => {
      socket.disconnect();
    };
  }, [dispatch, topic?._id]);
  // -----------------------------

  return (
      <div className="comments-container">
        <div className="answers d-flex align-items-center">
        <span className="stats d-flex align-items-center">
          {comments?.length > 0 ? comments?.length : "0"} Answers
        </span>
        </div>
        {getTopicCommentsState?.isLoading && (
            <>\
              <SkeletonComments />
              <SkeletonComments />
            </>
          )}
        {!getTopicCommentsState?.isLoading && comments?.length > 0 && (
            <CommentItem comments={comments} parentComment={null} topic={topic} />
        )}
      </div>
  );
};

export default CommentsContainer;