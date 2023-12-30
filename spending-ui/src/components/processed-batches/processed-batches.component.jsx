import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component";
import send from "../../utils/http_client";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";

const ProcessedBatches = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [contentUpdated, setContentUpdated] = useState(false);
    const [processedBatches, setProcessedBatches] = useState([]);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();

    const getProcessedBatches = async () => {
        const url = 'http://localhost:8000/resources/processed_batches'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        console.log("Start");
        if (processedBatches.length === 0 || contentUpdated) {
            setSectionTitle('Processed Batches');
            getProcessedBatches().then((res) => setProcessedBatches(res));
            setContentUpdated(false);
            setIsLoaded(true);
            console.log(processedBatches);
        } else {
            console.info("No definitions yet");
        }
    }, [processedBatches, contentUpdated]);

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<div>{row.notes}</div>);
    }

    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 2) {  // Notes column
            setActiveRow(row);
            e.preventDefault();
            e.stopPropagation();
            // setEditColumn(1);
            setEditTitle("Notes");
            setEditPrompt("text");
            setEditContent(row.notes);
            setOpenNotes(true);
        }
    }

    const closeModal = async (id, value, save_result) => {
        if (openNotes) {
            setOpenNotes(false);
            if(save_result) {
                console.log("Sending note: ", value);
                await updateNotes(id, value);
            }
        }
    }

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date', sort: true})

    columns.push({
        dataField: 'notes', text: 'Notes', formatter: noteColumnFormatter, events: {
            onClick: colNoteEvent
        }, style: {cursor: 'pointer'}
    })

    columns.push({dataField: 'transaction_batch_id', text: 'Transaction Batch Id', sort: true})
    columns.push({dataField: 'transaction_count', text: 'Transaction Count', sort: true})

    const double_click_handler = (e, row, index) => {
        navigate('/processed_transactions/' + row.id);
    }

    const updateNotes = async (processedBatch_id, note) => {
        var body = {"notes": note}
        console.log("Updating batch: " + processedBatch_id + " with note: " + body)

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/processed_batch/' + processedBatch_id;
        const method = 'POST'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);

        // Need to refresh data and re-render
        setContentUpdated(true);
    }

    if(isLoaded) {
        return(
            <>
                <h2>Double click a batch below to see the related transactions.</h2>
                <div id='processedBatchList'>
                    <TableBaseComponent
                        columns={columns}
                        data={processedBatches}
                        keyField='id'
                        double_click_handler={double_click_handler}
                    />
                </div>
                {
                    openNotes && activeRow && <ModalPromptComponent
                        closeHandler={closeModal}
                        content={editContent}
                        title={editTitle}
                        prompt_type={editPrompt}
                        entity_id={activeRow.id}/>

                }
            </>
        )
    }
}

export default ProcessedBatches;
