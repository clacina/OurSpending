import React, {useRef, useState} from "react";
import EditableList from "../widgets/editable-list/editable-list.component.jsx";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const NoteEditDialog = ({closeHandler, entity}) => {
    const notesRef = useRef(entity.notes);
    const [isOpen, setIsOpen] = useState(true);

    const assignNote = () => {
        closeHandler(notesRef.current);
    }

    const cancelNote = () => {
        setIsOpen(false);
        closeHandler(null);
    }

    return (
        <div>
            <Modal show={isOpen} onHide={cancelNote}>
                <Modal.Header closeButton>
                    <Modal.Title>Transaction Notes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditableList entity={notesRef}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelNote}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={assignNote}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default NoteEditDialog;
