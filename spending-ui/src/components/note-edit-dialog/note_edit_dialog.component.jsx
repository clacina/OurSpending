import React, {useState} from "react";
import {Row} from "react-bootstrap";
import ReactModal from "react-modal";
import {CButton} from "../processed-transactions/transaction_detail.component.styles.jsx";

const NoteEditDialog = ({closeHandler}) => {
    const [selection, setSelection] = useState('');

    const customStyles = {
        content: {
            top: '100px',
            left: '200px',
            width: '400px',
            height: '300px'
        },
    };

    const assignNote = () => {
        closeHandler(selection);
    }

    return (
        <div>
            <ReactModal
                isOpen={true}
                onRequestClose={closeHandler}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
            >
                <Row>
                    <h2>Add a Note</h2>
                </Row>
                <Row>
                    <textarea
                        rows={4}
                        cols={40}
                        value={selection}
                        onChange={e => setSelection(e.target.value)} />
                </Row>
                <Row>
                    <CButton
                        onClick={assignNote}>Assign</CButton>
                </Row>
            </ReactModal>

        </div>
    )
}

export default NoteEditDialog;
