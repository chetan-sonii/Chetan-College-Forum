import { Button } from "react-bootstrap"; //
import { Link } from "react-router-dom";
import { RiBallPenFill } from "react-icons/ri";
import TopContributorsCard from "./Cards/TopContributorsCard";
import TopHelpersCard from "./Cards/TopHelpersCard";

const RightSidebar = () => {
    return (
        // ✅ FIX: Changed from Col to div to fill the parent container
        <div className="right-sidebar">
            <Link className="new-topic mx-auto" to="/topic/new">
                <Button className="d-flex align-items-center" style={{ width: "100%", justifyContent: "center", marginBottom: "20px" }}>
                    <RiBallPenFill className="me-2" />
                    Write a New Topic
                </Button>
            </Link>
            <TopContributorsCard />
            <TopHelpersCard />
        </div>
    );
};

export default RightSidebar;