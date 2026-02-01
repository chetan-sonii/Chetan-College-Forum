import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAdminTags, createAdminTag, deleteAdminTag } from "../../redux/slices/adminSlice";
import { MdDelete, MdAdd, MdTag } from "react-icons/md";

const TagsTable = () => {
    const dispatch = useDispatch();
    const { tagsList } = useSelector((state) => state.admin);
    const [showModal, setShowModal] = useState(false);
    const [newTag, setNewTag] = useState({ name: "", color: "#546cfb" });

    useEffect(() => { dispatch(getAdminTags()); }, [dispatch]);

    const handleCreate = () => {
        if(newTag.name.trim()) {
            dispatch(createAdminTag(newTag));
            setNewTag({ name: "", color: "#546cfb" });
            setShowModal(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0">Tags Management</h3>
                <Button onClick={() => setShowModal(true)} variant="primary" className="d-flex align-items-center gap-2">
                    <MdAdd /> Create Tag
                </Button>
            </div>

            <div className="card border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                    <tr>
                        <th className="ps-4 py-3 border-0">Tag Name</th>
                        <th className="py-3 border-0">Color Preview</th>
                        <th className="py-3 border-0">Topics Count</th>
                        <th className="py-3 border-0 text-end pe-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tagsList.map(tag => (
                        <tr key={tag._id}>
                            <td className="ps-4 fw-bold text-dark">{tag.name}</td>
                            <td><Badge bg="none" style={{ backgroundColor: tag.color }}>{tag.color}</Badge></td>
                            <td className="text-muted">{tag.count || 0} topics</td>
                            <td className="text-end pe-4">
                                <Button variant="light" size="sm" className="text-danger" onClick={() => dispatch(deleteAdminTag(tag._id))}>
                                    <MdDelete size={18} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create New Tag</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Tag Name</Form.Label>
                        <Form.Control value={newTag.name} onChange={(e) => setNewTag({...newTag, name: e.target.value})} placeholder="e.g. javascript" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Tag Color</Form.Label>
                        <Form.Control type="color" value={newTag.color} onChange={(e) => setNewTag({...newTag, color: e.target.value})} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreate}>Create Tag</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TagsTable;