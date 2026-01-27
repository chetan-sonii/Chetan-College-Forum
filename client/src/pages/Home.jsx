import { Row, Col, Form, Container } from "react-bootstrap";
import TopicItem from "../components/Topic/TopicItem";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllTopics, setSortOption } from "../redux/slices/topicSlice";
import { resetUserProfile } from "../redux/slices/profileSlice";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import SkeletonTopicItem from "../components/Skeletons/SkeletonTopicItem";
import { useParams } from "react-router-dom";

const Home = () => {
  const dispatch = useDispatch();
  const { space } = useParams();
  const { topics, getAllTopicsIsLoading } = useSelector((state) => state.topic);
  const { sortOption, searchQuery } = useSelector((state) => state.topic);

  useEffect(() => {
    document.title = space ? `${space} Space | CHETAN Forum` : "Home | CHETAN Forum";
  }, [space]);

  useEffect(() => {
    dispatch(resetUserProfile());
    dispatch(getAllTopics({ sortOption, searchQuery, space }));
  }, [dispatch, sortOption, searchQuery, space]);

  return (
      <>
        <main>
          <Container>
            <Row>
              {/* ✅ FIX: Wrap LeftSidebar in Col lg={3} */}
              <Col lg={3} className="d-none d-lg-block">
                <LeftSidebar />
              </Col>

              {/* Middle Content - lg={6} */}
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
              </Col>

              {/* ✅ FIX: Wrap RightSidebar in Col lg={3} */}
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