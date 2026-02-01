import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addTopic, resetNewTopic, getSpaces } from "../redux/slices/topicSlice";
import CreatableSelect from "react-select/creatable";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import CreatePoll from "../components/Topic/Poll/CreatePoll";

// ✅ Import React Quill and its CSS
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles

const NewTopic = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // ReactQuill will manage this HTML string
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [poll, setPoll] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addTopic: { isLoading, isSuccess, isError, message, newTopicURL }, spaces } = useSelector(state => state.topic);

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && newTopicURL) {
      navigate(newTopicURL);
      dispatch(resetNewTopic());
    }
  }, [isSuccess, newTopicURL, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSpace) return alert("Please select a space");
    // Pass the HTML content directly
    dispatch(addTopic({ title, content, selectedSpace: selectedSpace.value, selectedTags, poll }));
  };

  const handlePollUpdate = (pollData) => {
    setPoll(pollData);
  };

  // ✅ Quill Modules: Customize the toolbar
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'code-block'], // Added code-block support
      ['clean']
    ],
  };

  // Prepare spaces for React-Select
  const spaceOptions = spaces?.map(space => ({ value: space.name, label: space.name }));

  return (
      <main>
        <Container>
          <Row>
            <Col lg={3} className="d-none d-lg-block">
              <LeftSidebar />
            </Col>
            <Col lg={6} className="main-content">
              <div className="new-topic-container">
                <h2 className="mb-4">Create a New Topic</h2>

                {isError && <Alert variant="danger">{message}</Alert>}
                {isSuccess && <Alert variant="success">{message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="What's on your mind?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Space</Form.Label>
                    <CreatableSelect
                        isClearable
                        options={spaceOptions}
                        onChange={setSelectedSpace}
                        placeholder="Select or Create a Space..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <CreatableSelect
                        isMulti
                        isClearable
                        onChange={setSelectedTags}
                        placeholder="Add tags..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    {/* ✅ Replaced Textarea with ReactQuill */}
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent} // Quill passes the HTML string directly
                        modules={modules}
                        style={{ height: '200px', marginBottom: '50px' }} // Added margin for toolbar
                    />
                  </Form.Group>

                  {/* Poll Section */}
                  <div className="mb-4 border p-3 rounded">
                    <h5 className="mb-3">Create a Poll (Optional)</h5>
                    <CreatePoll onUpdate={handlePollUpdate} />
                  </div>

                  <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
                    {isLoading ? "Posting..." : "Create Topic"}
                  </Button>
                </Form>
              </div>
            </Col>
            <Col lg={3} className="d-none d-lg-block">
              <RightSidebar />
            </Col>
          </Row>
        </Container>
      </main>
  );
};

export default NewTopic;