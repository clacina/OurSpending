import React, {useContext, useEffect, useState} from "react";
import {nanoid} from 'nanoid';

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import TagSelectorCategoryComponent from "../tag-selector/tag-selector-category.component.jsx";
import CategoryTitleComponent from "./category-title.component.jsx";
import TransactionDetailComponent from "./transaction_detail.component.jsx";

import send from "../../utils/http_client.js";


const CategoryComponent = ({category, display}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);

    // console.log("category: ", category);
    const uncategorized = category[0].template === null;

    useEffect(() => {
        if (transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.log("No definitions yet");
        }
    }, [transactionDataDefinitions.length]);

    const closeModal = async (note) => {
        console.log("Closed with: ", typeof note);
        if (openNotes) {
            setOpenNotes(false);
            console.log("Got notes: ", note);
            if (note) {
                var body = []
                note.forEach((item) => {
                    body.push({"id": item.id, "text": item.text})
                })

                const headers = {'Content-Type': 'application/json'}
                const url = 'http://localhost:8000/resources/transaction/' + activeRow.id + '/notes';
                const method = 'POST'
                const request = await send({url}, {method}, {headers}, {body});
                console.log("Response: ", request);
            }
        }
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        console.log("Tags for: ", transaction_id);
        console.log("        : ", tag_list);
        var body = []
        tag_list.forEach((item) => {
            body.push(item.value);
        })

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/tags';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<TagSelectorCategoryComponent tagsMap={tagsMap} transaction={row} onChange={changeTag}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 4) {  // tags column - it's a drop down
            e.stopPropagation();
        }
        console.log({e, column, columnIndex, row, rowIndex})
    }

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        // console.log("Row: ", row);
        const note_list = row.transaction.notes.map((note) => {
            return(note.note + " ");
        })
        return (<div>{note_list}</div>);
    }
    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row.transaction);
        if (columnIndex === 5) {  // Notes column
            e.preventDefault();
            console.log("colNoteEvent: ", activeRow);
            e.stopPropagation();
            setOpenNotes(true);
        }
    }

    // Define table columns
    const columns = []
    if (!uncategorized) {
        columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
        columns.push({dataField: 'template.hint', text: 'Template', editable: false, style: {cursor: 'pointer'}})
        columns.push({dataField: 'template.credit', text: 'Credit', editable: false, style: {cursor: 'pointer'}})
        columns.push({dataField: 'transaction.amount', text: 'Amount', editable: false, style: {cursor: 'pointer'}})
        columns.push({
            dataField: 'transaction.transaction_date',
            style: {cursor: 'pointer'},
            text: 'Date',
            editable: false})
        columns.push({
            dataField: 'transaction.tags',
            text: 'Tags',
            formatter: tagColumnFormatter,
            events: {
                onClick: colEvent
            },
            style: {cursor: 'pointer'}
        })
        columns.push({dataField: 'transaction.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
                onClick: colNoteEvent
            }, style: {cursor: 'pointer'}
        })
        columns.push({dataField: 'transaction.id', text: '', hidden: true})
    } else {
        columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
        columns.push({dataField: 'transaction.institution.name', text: 'Bank', editable: false})
        columns.push({dataField: 'transaction.amount', text: 'Amount', editable: false})
        columns.push({dataField: 'transaction.transaction_date', text: 'Date', editable: false})
        columns.push({dataField: 'transaction.tags', text: 'Tags'})
        columns.push({dataField: 'transaction.notes', text: 'Notes'})
        columns.push({dataField: 'transaction.id', text: '', hidden: true})
    }

    // Create unique id for each row
    category.forEach((item) => {
        item.keyid = nanoid();
    })

    // ----------------------- On Click Handlers ------------------------------

    const rowEvents = {
        // onClick: (e, row, index) => {
        //     setActiveRow(row);
        // },
        onContextMenu: (e, row, index) => {
            e.stopPropagation();
            showContext(e, row);
        }
    };

    const expandRow = {
        onlyOneExpanding: false,
        renderer: (row, rowIndex) => {
            console.log("Expanding: ", rowIndex);
            return(<TransactionDetailComponent row={row} />);

        },
        // onExpand: handleOnExpand
    }

    const showContext = (event, row) => {
        console.log("showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu",
            event: event
        });
    };

    function rowStyle(row, rowIndex) {
        // log("Style for row: ", row);
        // log("--: ", rowIndex);
    }

    // ----------------------------------------------------------------
    if(isLoaded) {
        return (
            <div>
                <Collapsible trigger={<CategoryTitleComponent category={category}/>}>
                    <BootstrapTable
                        keyField='keyid'
                        data={category}
                        columns={columns}
                        rowEvents={rowEvents}
                        rowStyle={rowStyle}
                        expandRow={expandRow}
                    />
                    <Menu id="context-menu" theme='dark'>
                        {activeRow && (
                            <>
                                <Item className="text-center">Header row {activeRow.id}</Item>
                                <Separator/>
                                {["Google", "Apple"].includes("Google") && (
                                    <Submenu label="Contact" arrow=">">
                                        <Item>Phone</Item>
                                        <Item>Email</Item>
                                    </Submenu>
                                )}
                                <Item disabled={true}>Add to Cart</Item>
                            </>
                        )}
                    </Menu>
                </Collapsible>
                {openNotes && activeRow && <NoteEditDialog closeHandler={closeModal} transaction={activeRow}/>}
            </div>
        )
    }
}

export default CategoryComponent;
