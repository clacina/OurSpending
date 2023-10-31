import React, {useRef, useState} from "react";
import {Col, Row} from "react-bootstrap";
import ReactModal from "react-modal";
import EditableList from "../editable-list/editable-list.component.jsx";
import {footer} from "./note_edit_dialog.component.styles.jsx";

const NoteEditDialog = ({closeHandler, entity}) => {
    const notesRef = useRef(entity.notes);
    const [isOpen, setIsOpen] = useState(true);
    console.log("Transaction: ", entity);

    const customStyles = {
        content: {
            top: '100px',
            left: '200px',
            width: '400px',
            height: '300px'
        },
    };

    const assignNote = () => {
        closeHandler(notesRef.current);
    }

    const cancelNote = () => {
        setIsOpen(false);
        closeHandler(null);
    }

    return (
        <div>
            <ReactModal
                isOpen={isOpen}
                onRequestClose={cancelNote}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
            >
                <Row>
                    <h2>Manage Notes</h2>
                </Row>
                <Row>
                    <EditableList entity={notesRef}/>
                </Row>
                <Row className={footer}>
                    <Col>
                        <button onClick={assignNote}>Done</button>
                    </Col>
                    <Col>
                        <button onClick={cancelNote}>Cancel</button>
                    </Col>
                </Row>
            </ReactModal>

        </div>
    )
}

export default NoteEditDialog;
