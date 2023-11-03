import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const ModalPromptComponent = ({entity_id, content, closeHandler, title, prompt_type='text'}) => {
    const [show, setShow] = useState(true);
    const [newContent, setNewContent] = useState(content);

    const handleClose = () => {
        closeHandler(entity_id, newContent, false);
        setShow(false);
    }

    const handleSave = () => {
        closeHandler(entity_id, newContent, true);
        setShow(false);
    }

    function updateContent(event) {
        console.log(event);
        setNewContent(event.target.value);
    }

    const changeCheck = () => {
        setNewContent(!newContent);
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
                            {prompt_type==='check' &&
                                <Form.Check
                                    type="switch"
                                    id="allTags"
                                    label="Are matching transactions Credits?"
                                    checked={newContent}
                                    onChange={changeCheck}
                                />
                            }
                            {prompt_type==='text' &&
                                <Form.Control onChange={updateContent} as="textarea" rows={3} autoFocus value={newContent}/>
                            }
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
