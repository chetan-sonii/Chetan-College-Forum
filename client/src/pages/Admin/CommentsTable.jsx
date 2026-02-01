import { useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminComments, deleteAdminComment } from "../../redux/slices/adminSlice";
import { MdDelete } from "react-icons/md";
import moment from "moment";

const CommentsTable = () => {
    const dispatch = useDispatch();
    const { commentsList, loadingResource } = useSelector((state) => state.admin);

    useEffect(() => { dispatch(getAdminComments()); }, [dispatch]);

    return (
        <div className="fade-in">
            <h3 className="fw-bold text-dark mb-4">Latest Comments (Moderation)</h3>
            <div className="card border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                    <tr>
                        <th className="ps-4 py-3 border-0" style={{ width: "20%" }}>Author</th>
                        <th className="py-3 border-0" style={{ width: "40%" }}>Content</th>
                        <th className="py-3 border-0" style={{ width: "20%" }}>Topic</th>
                        <th className="py-3 border-0 text-end pe-4">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loadingResource ? (
                        <tr><td colSpan="4" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                    ) : commentsList.map(comment => (
                        <tr key={comment._id}>
                            <td className="ps-4">
                                <div className="d-flex align-items-center">
                                    <img src={comment.author?.avatar?.url} className="rounded-circle me-2" width="25" alt=""/>
                                    <span className="fw-semibold">@{comment.author?.username || "Unknown"}</span>
                                </div>
                                <small className="text-muted">{moment(comment.createdAt).fromNow()}</small>
                            </td>
                            <td><p className="mb-0 small text-truncate" style={{ maxWidth: "300px" }}>{comment.content}</p></td>
                            <td><small className="text-primary">{comment.parentTopic?.title || "Deleted Topic"}</small></td>
                            <td className="text-end pe-4">
                                <Button variant="light" size="sm" className="text-danger" onClick={() => dispatch(deleteAdminComment(comment._id))}>
                                    <MdDelete />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default CommentsTable;