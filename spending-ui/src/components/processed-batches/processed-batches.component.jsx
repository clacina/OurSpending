import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";
import './processed-batches.component.styles.css';
import {ProcessedBatchesContext} from "../../contexts/processed_batches.context";

const ProcessedBatches = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();
    const {processedBatches, updateBatchNotes} = useContext(ProcessedBatchesContext);

    useEffect(() => {
        console.log("Start");
        if (processedBatches.length > 0) {
            setSectionTitle('Processed Batches');
            setIsLoaded(true);
            console.log(processedBatches);
        } else {
            console.info("No definitions yet");
        }
    }, [processedBatches]);

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<div>{row.notes}</div>);
    }

    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 2) {  // Notes column
            setActiveRow(row);
            e.preventDefault();
            e.stopPropagation();
            setEditTitle("Notes");
            setEditPrompt("text");
            setEditContent(row.notes);
            setOpenNotes(true);
        }
    }

    const dateColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        var utc = new Date(row.run_date);
        var offset = utc.getTimezoneOffset();
        return(new Date(utc.getTime() + offset * 60000).toDateString());
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

    const headerBackgroundColor = '#008080'
    const columns = [];
    columns.push({dataField: 'id', text: 'Id',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'100px',
        },
        sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date',
        formatter: dateColumnFormatter,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'300px',
        },
        sort: true})

    columns.push({
        dataField: 'notes', text: 'Notes', formatter: noteColumnFormatter,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colNoteEvent
        }, style: {cursor: 'pointer'}
    })

    columns.push({dataField: 'transaction_batch_id', text: 'Transaction Batch Id',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        sort: true})
    columns.push({dataField: 'transaction_count', text: 'Transaction Count',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        sort: true})

    const double_click_handler = (e, row, index) => {
        navigate('/processed_transactions/' + row.id);
    }

    const updateNotes = async (processedBatch_id, note) => {
        updateBatchNotes(processedBatch_id, note);
    }

    if(isLoaded) {
        return(
            <div id='processedBatchsContainer'>
                <p>Double Click any row to access the transactions for that batch.</p>
                <p>Click the 'Notes' column to edit that value.</p>
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
            </div>
        )
    }
}

export default ProcessedBatches;
