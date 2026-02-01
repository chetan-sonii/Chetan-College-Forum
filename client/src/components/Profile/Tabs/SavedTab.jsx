import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSavedTopics } from "../../../redux/slices/profileSlice";
import TopicItem from "../../Topic/TopicItem";
import SkeletonTopicItem from "../../Skeletons/SkeletonTopicItem";
import { Alert } from "react-bootstrap";
import { BsBookmark } from "react-icons/bs";

const SavedTab = () => {
    const dispatch = useDispatch();
    const { savedTopics, savedTopicsLoading } = useSelector((state) => state.profile);

    useEffect(() => {
        dispatch(getSavedTopics());
    }, [dispatch]);

    if (savedTopicsLoading) {
        return (
            <>
                <SkeletonTopicItem />
                <SkeletonTopicItem />
                <SkeletonTopicItem />
            </>
        );
    }

    if (!savedTopics || savedTopics.length === 0) {
        return (
            <Alert variant="light" className="text-center p-5 border-0">
                <BsBookmark size={40} className="text-muted mb-3" />
                <h5 className="text-muted">You haven't saved any topics yet.</h5>
                <p className="text-muted small">Bookmark interesting discussions to find them here later.</p>
            </Alert>
        );
    }

    return (
        <div className="saved-topics-list">
            {savedTopics.map((topic) => (
                <TopicItem key={topic._id} topic={topic} />
            ))}
        </div>
    );
};

export default SavedTab;