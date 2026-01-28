import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { IoMdAdd, IoMdTrash, IoMdTime } from "react-icons/io";
import { BsBarChartSteps } from "react-icons/bs";

const CreatePoll = ({ onPollChange }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [duration, setDuration] = useState(1);

    useEffect(() => {
        const validOptions = options.map(o => o.trim()).filter(Boolean);
        if (question.trim() && validOptions.length >= 2) {
            onPollChange({ question: question.trim(), options: validOptions, duration });
        } else {
            onPollChange(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question, options, duration]);

    const handleOptionChange = (index, value) => {
        setOptions(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const addOption = () => {
        if (options.length < 5) setOptions(prev => [...prev, ""]);
    };

    const removeOption = (index) => {
        if (options.length > 2) setOptions(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Card className="createpoll-card mb-4 shadow-sm border-0">
            <Card.Body className="p-4">
                <div className="createpoll-top mb-3">
                    <div className="d-flex align-items-center gap-2 createpoll-header">
                        <BsBarChartSteps size={22} />
                        <h5 className="m-0 fw-bold createpoll-title">Create Poll</h5>
                    </div>
                </div>

                <Form.Group className="mb-4 createpoll-group">
                    <Form.Label className="createpoll-field-label">Poll question</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ask something clear and concise..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="createpoll-question"
                        aria-label="Poll question"
                    />
                    <Form.Text className="createpoll-help">Keep it short — voters skim.</Form.Text>
                </Form.Group>

                <div className="mb-3">
                    <Form.Label className="createpoll-field-label">Options</Form.Label>

                    <div className="d-flex flex-column createpoll-options">
                        {options.map((opt, idx) => (
                            <div key={idx} className="d-flex align-items-center createpoll-option-row">
                                <div className="createpoll-index" aria-hidden>{idx + 1}</div>

                                <input
                                    className="form-control createpoll-option-input"
                                    type="text"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    aria-label={`Option ${idx + 1}`}
                                />

                                {options.length > 2 ? (
                                    <Button
                                        variant="link"
                                        className="createpoll-remove-btn"
                                        onClick={() => removeOption(idx)}
                                        title={`Remove option ${idx + 1}`}
                                    >
                                        <IoMdTrash size={18} />
                                    </Button>
                                ) : (
                                    <div style={{ width: 40 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Row className="g-3 align-items-center mt-3">
                    <Col xs={12} md={6}>
                        {options.length < 5 ? (
                            <Button
                                className="createpoll-add-btn d-inline-flex align-items-center gap-1"
                                onClick={addOption}
                                aria-label="Add option"
                            >
                                <IoMdAdd size={16} /> Add option
                            </Button>
                        ) : (
                            <small className="text-muted fst-italic">Max 5 options reached</small>
                        )}
                    </Col>

                    <Col xs={12} md={6} className="d-flex justify-content-md-end">
                        <div className="createpoll-duration d-flex align-items-center gap-2">
                            <IoMdTime size={18} />
                            <span className="small fw-semibold text-muted">Duration</span>
                            <Form.Select
                                size="sm"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                aria-label="Poll duration"
                                className="createpoll-select"
                            >
                                <option value={1}>1 Day</option>
                                <option value={3}>3 Days</option>
                                <option value={7}>1 Week</option>
                            </Form.Select>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CreatePoll;
