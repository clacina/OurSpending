import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import React, {useContext, useEffect, useState} from "react";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
    PaginationListStandalone,
    PaginationTotalStandalone,
    SizePerPageDropdownStandalone
} from 'react-bootstrap-table2-paginator';
import send from "../../utils/http_client";
import {contextMenu} from "react-contexify";
import TagSelectorCategoryComponent from "../widgets/tag-selector/tag-selector-category.component";
import {TagsContext} from "../../contexts/tags.context";
import assert from "assert";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";

// https://flatuicolors.com/palette/fr

const TransactionList = ({institution_id, transactions}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions, institutions} = useContext(StaticDataContext);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [editColumn, setEditColumn] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")
    const [editContent, setEditContent] = useState("");
    const [ourInstitution, setOurInstitution] = useState("");
    const [columns, setColumns] = useState([]);
    const [contentUpdated, setContentUpdated] = useState(false);
    const [transactionContentUpdated, setTransactionContentUpdated] = useState(false);

    const {tagsMap, addTag} = useContext(TagsContext);

    useEffect(() => {
        if(transactionDataDefinitions.length !== 0 && institutions.length !== 0) {
            const inst = institutions.find((i) => {
                return (i.id === institution_id)
            })
            setOurInstitution(inst);
            generateColumns();

            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, institutions.length]);

    const generateColumns = () => {
        //-------------- Configure our table -----------------------------
        const headerBackgroundColor = '#008080'

        // Create column definitions for this institution
        const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(institution_id));
        const cols = [];

        // Build in order - Date, Amount, Description
        var text_align = 'right';
        var column_type = 'number'

        // Date Column
        const dateColumn = dataDefinition.find((item) => {
            return(item.is_transaction_date);
        });
        assert(dateColumn);
        cols.push({
            dataField: dateColumn.data_id,
            text: 'Date',
            type: column_type,
            align: 'left',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '100px',
            }
        });

        // Amount Column
        const amountColumn = dataDefinition.find((item) => {
            return(item.is_amount);
        })
        assert(amountColumn);

        cols.push({
            dataField: amountColumn.data_id,
            text: 'Amount',
            type: column_type,
            align: text_align,
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        // Description Column
        const descriptionColumn = dataDefinition.find((item) => {
            return(item.is_description);
        })
        assert(descriptionColumn);
        var col_width = '900px';
        text_align = 'left';
        column_type = 'string';
        cols.push({
            dataField: descriptionColumn.data_id,
            text: 'Description',
            type: column_type,
            align: text_align,
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: col_width,
            }
        });

        // Add Tags and Notes columns

        cols.push({
            dataField: 'entity.tags', text: 'Tags',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '320px'
            },
            formatter: tagColumnFormatter,
            events: {
                onClick: colEvent
            },
            style: {cursor: 'pointer'}
        })

        cols.push({
            dataField: 'transaction.notes', text: 'Notes',
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            events: {
                onClick: colEvent
            },
            formatter: noteColumnFormatter,
            style: {cursor: 'pointer'}
        })
        columns.push({dataField: 'id', text: '', hidden: true})

        setColumns(cols);
    }

    const updateTags = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        var body = []

        if(typeof tag_list === "string") {  // creating a new tag
            // Have TagContext handle adding the new tag to the system
            const newTagId = await addTag(tag_list);
            body.push(newTagId);
        } else {  // assign an existing tag
            tag_list.forEach((item) => {
                body.push(item.value);
            })
        }

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/tags';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});

        setTransactionContentUpdated(true);
        setContentUpdated(true);
    }

    const updateNotes = async (transaction_id, note) => {
        var body = {'note': note}

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/notes';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});

        setTransactionContentUpdated(true);
        setContentUpdated(true);
    }

    //-------------------- Event Handlers ---------------------------------
    const closeModal = async (id, value, save_result) => {
        if (openNotes) {
            console.log("Close Modal: ", value);
            setOpenNotes(false);
            if(save_result) {
                console.log("---Saving: ", editColumn);
                switch(editColumn) {
                    case 1: // hint
                        if(value.length === 0) {
                            alert("Cannot set the hint to an empty string.");
                            return;
                        }
                        // await updateHint(id, value);
                        break;
                    case 2: // credit
                        // await updateCredit(id, value);
                        break;
                    case 4: // notes
                        await updateNotes(id, value);
                        break;
                    default: break;
                }
            }
        }
    }

    const rowEvents = {
        onContextMenu: (e, row, index) => {
            showContext(e, row);
        }
    };

    const showContext = (event, row) => {
        console.log("showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu",
            event: event
        });
    };

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const note_list = row.notes.map((note) => {
            return(note.note + " ");
        })
        return (<div>{note_list}</div>);
    }

    function compareTags(a, b) {
        return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const entity_info = {
            id: row.id,
            tags: row.tags
        }
        return (<TagSelectorCategoryComponent
            tagsMap={tagsMap}
            entity={entity_info}
            onChange={updateTags}
            canCreate={true}/>);
    }

    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2));
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        console.log("Click col: ", columnIndex);
        console.log("Click row: ", rowIndex);
        console.log("Row: ", row);
        switch (columnIndex) {
            case 3: // tags
                e.preventDefault();
                e.stopPropagation();
                break;
            case 4: // notes
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(4);
                setEditPrompt("text");
                setEditTitle("Transaction Note");
                setEditContent(row.notes);
                setOpenNotes(true);
                break;
            default:
                break
        }
    }

    if(isLoaded) {
        return (
            <div>
                <h1>{ourInstitution.name}</h1>
                    <BootstrapTable
                        keyField='keyid'
                        data={transactions}
                        columns={columns}
                        pagination={paginationFactory()}
                    />
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

export default TransactionList;
