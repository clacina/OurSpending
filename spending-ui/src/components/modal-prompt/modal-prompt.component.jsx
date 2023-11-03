import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const ModalPromptComponent = ({entity_id, content, closeHandler, title}) => {
    const [show, setShow] = useState(true);
    const [newContent, setNewContent] = useState("");

    const handleClose = () => {
        closeHandler(entity_id, newContent, false);
        setShow(false);
    }

    const handleSave = () => {
        closeHandler(entity_id, newContent, true);
        setShow(false);
    }

    function updateContent(event) {
        setNewContent(event.target.value);
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Control onChange={updateContent} as="textarea" rows={3} autoFocus value={content}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalPromptComponent;
