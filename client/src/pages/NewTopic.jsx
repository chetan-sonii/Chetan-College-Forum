import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addTopic, resetNewTopic, getSpaces } from "../redux/slices/topicSlice";
import CreatePoll from "../components/Topic/Poll/CreatePoll"; // ✅ Import Poll Component
import { BsBarChartFill } from "react-icons/bs";

const NewTopic = () => {
  const dispatch = useDispatch();

  // ✅ Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState(null);

  const { message, isLoading, isSuccess, isError, newTopicURL } = useSelector(
      (state) => state.topic.addTopic
  );

  const { spaces } = useSelector((state) => state.topic);

  useEffect(() => {
    document.title = "Add New Topic | CHETAN Forum";
  }, []);

  useEffect(() => {
    dispatch(resetNewTopic());
    dispatch(getSpaces());
  }, [dispatch]);

  const options = spaces?.map((space) => ({
    value: space.name,
    label: space.name,
  })) || [];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ FIX: Initialize as null, store full object
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || title?.trim()?.length === 0) return;
    if (!content || content?.trim()?.length === 0) return;
    if (!selectedSpace) return;
    if (!selectedTags || selectedTags.length === 0) return;

    try {
      dispatch(addTopic({
        title,
        content,
        selectedSpace: selectedSpace.value, // ✅ Now works because selectedSpace is an object
        selectedTags,
        poll: showPoll ? pollData : null // ✅ Send Poll Data
      }));
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
      <main>
        <Container>
          <Row className="new-topic align-items-center justify-content-center">
            <Col lg={8}>
              <section className="new-topic-form">
                {isLoading && <div className="loader"></div>}
                <h5 className="section-title">Add New Topic</h5>
                {message && (
                    <div
                        className={`message ${isError ? "error" : ""} ${
                            isSuccess ? "success" : ""
                        } ${isLoading ? "info" : ""}`}
                    >
                      {`${message} `}
                      {newTopicURL && (
                          <Link to={newTopicURL}>Click here to preview it.</Link>
                      )}
                    </div>
                )}
                <Form className="floating" onSubmit={handleSubmit}>
                  <Form.Group
                      className="form-group mb-3"
                      as={Col}
                      controlId="topicTitle"
                  >
                    <Form.Control
                        type="text"
                        name="title"
                        value={title}
                        disabled={isLoading}
                        placeholder="Enter topic title..."
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Form.Label>Topic Title</Form.Label>
                  </Form.Group>
                  <Form.Group
                      className="form-group mb-3"
                      as={Col}
                      controlId="topicDescription"
                  >
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={content}
                        disabled={isLoading}
                        placeholder="Enter topic content..."
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Form.Label>Topic Content</Form.Label>
                  </Form.Group>

                  <Form.Group className="form-group select2-container mb-3">
                    <Select
                        classNamePrefix="form-control"
                        placeholder="Choose Topic's Space..."
                        title="space"
                        options={options}
                        isDisabled={isLoading}
                        // ✅ FIX: Bind directly to the object state
                        value={selectedSpace}
                        onChange={(e) => setSelectedSpace(e)}
                    />
                    <Form.Label className="control-label">Topic Space</Form.Label>
                  </Form.Group>

                  <Form.Group className="form-group select2-container mb-3">
                    <CreatableSelect
                        components={{
                          Menu: () => null,
                          DropdownIndicator: () => null,
                          IndicatorSeparator: () => null,
                        }}
                        placeholder="Enter Topic Tags..."
                        isMulti
                        isDisabled={isLoading}
                        value={selectedTags}
                        onChange={(e) => setSelectedTags(e)}
                    />
                    <Form.Label className="control-label">Topic Tags</Form.Label>
                  </Form.Group>

                  {/* ✅ Poll Button */}
                  <div className="mb-3">
                    <Button
                        variant={showPoll ? "danger" : "primary"}
                        size="sm"
                        onClick={() => setShowPoll(!showPoll)}
                        className="d-flex align-items-center gap-2 text-white" // Added text-white
                    >
                      <BsBarChartFill /> {showPoll ? "Remove Poll" : "Add Poll"}
                    </Button>
                  </div>

                  {/* ✅ Poll Component */}
                  {showPoll && <CreatePoll onPollChange={setPollData} />}

                  <Button
                      disabled={isLoading}
                      className="mb-4 w-100"
                      type="submit"
                  >
                    {isLoading ? "Adding Topic..." : "Add Topic"}
                  </Button>
                </Form>
              </section>
            </Col>
          </Row>
        </Container>
      </main>
  );
};

export default NewTopic;