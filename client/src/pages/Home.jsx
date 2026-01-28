import { Row, Col, Form, Container } from "react-bootstrap";
import TopicItem from "../components/Topic/TopicItem";
import { useDispatch, useSelector } from "react-redux";
import {useEffect, useState} from "react";
import { getAllTopics, setSortOption } from "../redux/slices/topicSlice";
import { resetUserProfile } from "../redux/slices/profileSlice";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import SkeletonTopicItem from "../components/Skeletons/SkeletonTopicItem";
import { useParams } from "react-router-dom";
import Pagination from "../components/Pagination/Pagination";

const Home = () => {
  const dispatch = useDispatch();
  const { space } = useParams();
  const { topics, getAllTopicsIsLoading, totalPages, currentPage } = useSelector((state) => state.topic);
  const { sortOption, searchQuery } = useSelector((state) => state.topic);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = space ? `${space} Space | CHETAN Forum` : "Home | CHETAN Forum";
  }, [space]);

  useEffect(() => {
    dispatch(resetUserProfile());
    dispatch(getAllTopics({ sortOption, searchQuery, space, page }));
  }, [dispatch, sortOption, searchQuery, space, page]);

  useEffect(() => {
    setPage(1);
  }, [sortOption, searchQuery, space]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0); // Scroll to top
    }
  };


  return (
      <>
        <main>
          <Container>
            <Row>
              {/* ✅ FIX 1: Wrap LeftSidebar in Col (3 units wide) */}
              {/* d-none d-lg-block hides it on mobile/tablet */}
              <Col lg={3} className="d-none d-lg-block">
                <LeftSidebar />
              </Col>

              {/* Middle Content (6 units wide) */}
              <Col lg={6} className="main-content">
                <div className="filter">
                  {space && <h4 className="mb-3 text-capitalize">Space: {space}</h4>}

                  <Form.Select
                      name="topicsSort"
                      className="custom-select"
                      onChange={(e) => dispatch(setSortOption(e.target.value))}
                      value={sortOption}
                  >
                    <option value="latest">Latest topics</option>
                    <option value="popular">Most popular topics</option>
                    <option value="most_replied">Most replied topics</option>
                    <option value="most_upvoted">Most upvoted topics</option>
                  </Form.Select>
                </div>

                <div className="topics">
                  {getAllTopicsIsLoading ? (
                      <>
                        <SkeletonTopicItem />
                        <SkeletonTopicItem />
                      </>
                  ) : (
                      topics?.map((topic) => (
                          <TopicItem key={topic._id} topic={topic} />
                      ))
                  )}
                  {!getAllTopicsIsLoading && topics?.length === 0 && (
                      <p className="text-muted text-center mt-5">No topics found in this space.</p>
                  )}
                </div>
                {/* ✅ ADD PAGINATION HERE */}
                {!getAllTopicsIsLoading && topics?.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
              </Col>

              {/* ✅ FIX 2: Wrap RightSidebar in Col (3 units wide) */}
              <Col lg={3} className="d-none d-lg-block">
                <RightSidebar />
              </Col>
            </Row>
          </Container>
        </main>
      </>
  );
};

export default Home;