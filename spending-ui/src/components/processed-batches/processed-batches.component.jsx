import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import {StaticDataContext} from "../../contexts/static_data.context";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";
import './processed-batches.component.styles.css';
import {ProcessedBatchesContext} from "../../contexts/processed_batches.context";

import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import {contextMenu, Item, Menu, Separator, Submenu} from "react-contexify";

const ProcessedBatches = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openNotes, setOpenNotes] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text");
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();
    const {processedBatches, updateBatchNotes, deleteBatches} = useContext(ProcessedBatchesContext);

    useEffect(() => {
        console.log("Start");
        setSectionTitle('Processed Batches');
        if (processedBatches.length > 0) {
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
        return(new Date(utc.getTime() - offset * 60000).toLocaleString());
    }

    const closeNotes = async (id, value, save_result) => {
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
        align: 'right',
        sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date',
        formatter: dateColumnFormatter,
        align: 'right',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'200px',
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
        headerAttrs: {
            width:'100px',
        },
        align: 'center',
        sort: true})
    columns.push({dataField: 'transaction_count', text: 'Transaction Count',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'200px',
        },
        align: 'right',
        sort: true})

    const updateNotes = async (processedBatch_id, note) => {
        updateBatchNotes(processedBatch_id, note);
    }

    const handleOnSelect = (row, isSelect, rowIndex, e) => {
        // if (isSelect && row.id < 3) {
        //     alert('Oops, You can not select Product ID which less than 3');
        //     return false; // return false to deny current select action
        // }
        console.log("Select: " + row + " selected: " + isSelect);
        var newRows = selectedRows;
        if(isSelect) {
            newRows.push(row);
        } else {
            newRows = selectedRows.filter(curRow => curRow.id !== row.id);
        }
        setSelectedRows(newRows);

        return true; // return true or don't return to approve current select action
    }

    const handleOnSelectAll = (isSelect, rows) => {
        if (isSelect) {
            setSelectedRows(rows);
            return rows.filter(r => r.id >= 0).map(r => r.id);
        }
        setSelectedRows([]);
    }

    const selectRow = {
        mode: 'checkbox',
        // clickToSelect: true,
        headerColumnStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        onSelect: handleOnSelect,
        onSelectAll: handleOnSelectAll,
    };

    const rowEvents = {
        // onClick: (e, row, rowIndex) => {
        //     console.log("Click: ", e);
        // },
        onContextMenu: (e, row, index) => {
            showContext(e, row);
        },
        onDoubleClick: (e, row, index) => {
            navigate('/processed_transactions/' + row.id);
        }
    };

    const handleContextClick = (id, props, data, triggerEvent) => {
        switch(id.id) {
            case 'delete_selected':
                console.log("Got delete of " + selectedRows.length + " items.");
                console.log("Deleting the following batches: ");
                selectedRows.forEach((item) => {
                    console.log("--", item);
                })
                const rows = selectedRows.map((item) => {
                    return(item.id);
                })
                console.log("Deleting the following batches: ", rows);
                deleteBatches(rows);
                break;
            default: console.log("✔ Context Click ID: ", id);
                console.log(" -- : ", props);
                console.log(" -- : ", data);
                console.log(" -- : ", triggerEvent);
                     break;
        }
    }

    const showContext = (event, row) => {
        console.log("⚠️showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu",
            event: event
        });
    };

    if(isLoaded) {
        return(
            <div id='processedBatchsContainer'>
                <p>Double Click any row to access the transactions for that batch.</p>
                <p>Click the 'Notes' column to edit that value.</p>
                <div id='processedBatchList'>
                    <BootstrapTable
                        columns={columns}
                        data={processedBatches}
                        selectRow={selectRow}
                        rowEvents={rowEvents}
                        keyField='id'
                    />
                </div>
                <Menu id="context-menu" theme='light'>
                    {activeRow && (
                        <>
                            <Item disabled className="text-center">Selection {activeRow.id}</Item>
                            <Separator />
                            <Item id="delete_selected" onClick={handleContextClick}>Delete {selectedRows.length} Selected Batches</Item>
                        </>
                    )}
                </Menu>
                {
                    openNotes && activeRow && <ModalPromptComponent
                        closeHandler={closeNotes}
                        content={editContent}
                        title={editTitle}
                        prompt_type={editPrompt}
                        entity_id={activeRow.id}/>
                }
            </div>
        )
    } else {
        return(
            <div className='messagePanel'>
                <h1>No Processed Batches Found</h1>

            </div>
        )
    }
}

export default ProcessedBatches;
