import { useState } from "react";
import { ProgressBar, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { voteOnPoll } from "../../../redux/slices/topicSlice";

const PollItem = ({ poll, topicId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [selectedOption, setSelectedOption] = useState(null);

    // 1. Check if poll expired
    const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

    // 2. Check if current user has voted
    const hasVoted = user && poll.voters.includes(user._id);

    // 3. Calculate total votes for percentage
    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

    const handleVote = () => {
        if (selectedOption !== null) {
            dispatch(voteOnPoll({ topicId, optionIndex: selectedOption }));
        }
    };

    // RENDER: Results Mode (User voted OR Poll expired)
    if (hasVoted || isExpired) {
        return (
            <div className="poll-container p-3 mb-3 border rounded">
                <h6 className="fw-bold mb-3">{poll.question}</h6>
                {poll.options.map((opt, idx) => {
                    const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    return (
                        <div key={idx} className="mb-3">
                            <div className="d-flex justify-content-between small mb-1">
                                <span>{opt.text}</span>
                                <span className="fw-bold">{percent}%</span>
                            </div>
                            <ProgressBar
                                now={percent}
                                variant={percent > 50 ? "success" : "info"}
                                style={{ height: "8px" }}
                            />
                            <small className="text-muted">{opt.votes} votes</small>
                        </div>
                    );
                })}
                <div className="text-muted small mt-2">
                    {totalVotes} total votes • {isExpired ? "Poll Closed" : "Final Results"}
                </div>
            </div>
        );
    }

    // RENDER: Voting Mode
    return (
        <div className="poll-container p-3 mb-3 border rounded bg-white">
            <h6 className="fw-bold mb-3">{poll.question}</h6>
            <Form>
                {poll.options.map((opt, idx) => (
                    <div key={idx} className="mb-2 p-2 border rounded hover-bg-light">
                        <Form.Check
                            type="radio"
                            id={`poll-${topicId}-${idx}`}
                            name={`poll-${topicId}`}
                            label={opt.text}
                            onChange={() => setSelectedOption(idx)}
                        />
                    </div>
                ))}
            </Form>
            <Button
                variant="primary"
                size="sm"
                className="mt-2"
                disabled={selectedOption === null || !user}
                onClick={handleVote}
            >
                Vote
            </Button>
            {!user && <small className="d-block text-danger mt-2">Login to vote</small>}
            <div className="text-muted small mt-2">
                {totalVotes} votes • Ends {new Date(poll.expiresAt).toLocaleDateString()}
            </div>
        </div>
    );
};

export default PollItem;