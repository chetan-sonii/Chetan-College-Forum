import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addTopic, resetNewTopic, getSpaces } from "../redux/slices/topicSlice";
import CreatePoll from "../components/Topic/Poll/CreatePoll";
import { BsBarChartFill, BsPencilSquare } from "react-icons/bs";

// ✅ Rich Text Editor Imports
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NewTopic = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // Redux
  const { message, isLoading, isSuccess, isError, newTopicURL } = useSelector(
      (state) => state.topic.addTopic
  );
  const { spaces } = useSelector((state) => state.topic);

  useEffect(() => {
    document.title = "Create New Topic | CHETAN Forum";
    dispatch(getSpaces());
    dispatch(resetNewTopic());
  }, [dispatch]);

  // Redirect on Success
  useEffect(() => {
    if (isSuccess && newTopicURL) {
      navigate(newTopicURL);
      dispatch(resetNewTopic());
    }
  }, [isSuccess, newTopicURL, navigate, dispatch]);

  const spaceOptions = spaces?.map((space) => ({
    value: space.name,
    label: space.name,
  })) || [];

  // Quill Toolbar Configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a title");
    if (!content.trim() || content === "<p><br></p>") return alert("Please write some content");
    if (!selectedSpace) return alert("Please select a space");

    const topicData = {
      title,
      content,
      selectedSpace: selectedSpace.value,
      selectedTags,
      poll: showPoll ? pollData : null
    };

    dispatch(addTopic(topicData));
  };

  return (
      <main>
        <Container>
          <div className="new-topic-container">

            {/* Header Section */}
            <div className="new-topic-header mb-4 text-center text-md-start">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary rounded-circle p-2 text-white d-none d-md-block">
                  <BsPencilSquare size={24} />
                </div>
                <div>
                  <h3>Start a New Discussion</h3>
                  <p>Share your knowledge, ask questions, or start a debate.</p>
                </div>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="new-topic-card">

              {isError && <Alert variant="danger" className="mb-4">{message}</Alert>}

              <Form onSubmit={handleSubmit}>

                {/* 1. Massive Title Input */}
                <Form.Group className="mb-5">
                  <Form.Control
                      type="text"
                      className="modern-input-title"
                      placeholder="Type your topic title here..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                  />
                </Form.Group>

                <Row className="g-4 mb-4">
                  {/* 2. Space Selector */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="modern-label">Choose a Space</Form.Label>
                      <Select
                          classNamePrefix="form-control"
                          className="modern-select"
                          placeholder="Select Space..."
                          options={spaceOptions}
                          isDisabled={isLoading}
                          value={selectedSpace}
                          onChange={setSelectedSpace}
                      />
                    </Form.Group>
                  </Col>

                  {/* 3. Tags Selector */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="modern-label">Add Tags (Optional)</Form.Label>
                      <CreatableSelect
                          classNamePrefix="form-control"
                          className="modern-select"
                          placeholder="Type and press enter..."
                          isMulti
                          isDisabled={isLoading}
                          value={selectedTags}
                          onChange={setSelectedTags}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* 4. Rich Text Editor */}
                <Form.Group className="mb-4">
                  <Form.Label className="modern-label">Your Content</Form.Label>
                  <div className="editor-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        placeholder="Write something amazing..."
                    />
                  </div>
                </Form.Group>

                {/* 5. Poll Section */}
                {showPoll ? (
                    <div className="poll-section fade-in">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0 fw-bold text-primary">Poll Details</h5>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setShowPoll(false)}
                            className="rounded-pill"
                        >
                          Cancel Poll
                        </Button>
                      </div>
                      {/* ✅ Pass callback correctly */}
                      <CreatePoll onPollChange={setPollData} />
                    </div>
                ) : (
                    <div className="mt-4">
                      <Button
                          variant="light"
                          className="poll-toggle-btn text-primary border"
                          onClick={() => setShowPoll(true)}
                      >
                        <BsBarChartFill className="me-2" />
                        Create a Poll
                      </Button>
                    </div>
                )}

                {/* 6. Submit Button */}
                <div className="submit-btn-container d-flex justify-content-end">
                  <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="btn-submit-topic"
                  >
                    {isLoading ? (
                        <span><span className="spinner-border spinner-border-sm me-2"/>Posting...</span>
                    ) : (
                        "Post Topic"
                    )}
                  </Button>
                </div>

              </Form>
            </div>
          </div>
        </Container>
      </main>
  );
};

export default NewTopic;