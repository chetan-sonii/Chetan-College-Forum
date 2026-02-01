import { Row, Col, Form, Container, Badge, Button, Stack } from "react-bootstrap";
import TopicItem from "../components/Topic/TopicItem";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllTopics, setSortOption, setSearchQuery } from "../redux/slices/topicSlice";
import { resetUserProfile } from "../redux/slices/profileSlice";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import SkeletonTopicItem from "../components/Skeletons/SkeletonTopicItem";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Pagination from "../components/Pagination/Pagination";
import { IoClose, IoFilter } from "react-icons/io5";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Get Params for Space and Tags
  const { space } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag");

  const { topics, getAllTopicsIsLoading, totalPages, currentPage } = useSelector((state) => state.topic);
  const { sortOption, searchQuery } = useSelector((state) => state.topic);
  const [page, setPage] = useState(1);

  // 2. Set Page Title
  useEffect(() => {
    if (space) document.title = `${space} Space | CHETAN Forum`;
    else if (tag) document.title = `${tag} - Tag | CHETAN Forum`;
    else document.title = "Home | CHETAN Forum";
  }, [space, tag]);

  // 3. Fetch Topics with ALL filters (Space, Tag, Search, Sort)
  useEffect(() => {
    dispatch(resetUserProfile());
    dispatch(getAllTopics({ sortOption, searchQuery, space, tag, page }));
  }, [dispatch, sortOption, searchQuery, space, tag, page]);

  useEffect(() => {
    setPage(1);
  }, [sortOption, searchQuery, space, tag]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // 4. Handlers for Clearing Filters
  const clearSpace = () => navigate("/");
  const clearTag = () => {
    searchParams.delete("tag");
    setSearchParams(searchParams);
  };
  const clearSearch = () => dispatch(setSearchQuery(""));

  const resetAllFilters = () => {
    navigate("/"); // Clears Space & Tag (since tag is query param on root)
    dispatch(setSearchQuery(""));
    dispatch(setSortOption("latest"));
  };

  // Check if any filter is active
  const isFiltering = space || tag || searchQuery;

  return (
      <>
        <main>
          <Container>
            <Row>
              <Col lg={3} className="d-none d-lg-block">
                <LeftSidebar />
              </Col>

              <Col lg={6} className="main-content">
                {/* Header & Sort Section */}
                <div className="d-flex align-items-center justify-content-between mb-3 filter-header">
                  <h4 className="mb-0 fw-bold">
                    {space ? `Space: ${space}` : tag ? `Tag: ${tag}` : "All Topics"}
                  </h4>
                  <Form.Select
                      style={{ width: "180px", cursor: "pointer" }}
                      name="topicsSort"
                      className="custom-select shadow-none border-secondary"
                      onChange={(e) => dispatch(setSortOption(e.target.value))}
                      value={sortOption}
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Popular</option>
                    <option value="most_replied">Most Replied</option>
                    <option value="most_upvoted">Most Upvoted</option>
                  </Form.Select>
                </div>

                {/* ✅ ACTIVE FILTERS BAR */}
                {isFiltering && (
                    <div className="active-filters mb-4 p-2 bg-light rounded d-flex align-items-center flex-wrap gap-2">
                      <small className="text-muted fw-bold me-1"><IoFilter /> Filters:</small>

                      {space && (
                          <Badge bg="primary" className="d-flex align-items-center gap-1 px-2 py-2">
                            Space: {space} <IoClose style={{cursor:"pointer"}} size={16} onClick={clearSpace} />
                          </Badge>
                      )}

                      {tag && (
                          <Badge bg="info" className="d-flex align-items-center gap-1 px-2 py-2 text-dark">
                            Tag: {tag} <IoClose style={{cursor:"pointer"}} size={16} onClick={clearTag} />
                          </Badge>
                      )}

                      {searchQuery && (
                          <Badge bg="warning" className="d-flex align-items-center gap-1 px-2 py-2 text-dark">
                            Search: "{searchQuery}" <IoClose style={{cursor:"pointer"}} size={16} onClick={clearSearch} />
                          </Badge>
                      )}

                      <Button variant="link" size="sm" className="text-danger text-decoration-none ms-auto" onClick={resetAllFilters}>
                        Reset All
                      </Button>
                    </div>
                )}

                <div className="topics">
                  {getAllTopicsIsLoading ? (
                      <>
                        <SkeletonTopicItem />
                        <SkeletonTopicItem />
                        <SkeletonTopicItem />
                      </>
                  ) : (
                      topics?.map((topic) => (
                          <TopicItem key={topic._id} topic={topic} />
                      ))
                  )}

                  {!getAllTopicsIsLoading && topics?.length === 0 && (
                      <div className="text-center mt-5">
                        <p className="text-muted fs-5">No topics found matching your filters.</p>
                        <Button variant="outline-primary" onClick={resetAllFilters}>
                          Clear Filters
                        </Button>
                      </div>
                  )}
                </div>

                {!getAllTopicsIsLoading && topics?.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
              </Col>

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