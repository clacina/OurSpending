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


const CategoryComponent = ({category, display, eventHandler}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);

    console.log("Category: ", category);

    useEffect(() => {
        if (transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.log("No definitions yet");
        }
    }, [transactionDataDefinitions.length]);

    const closeModal = async (note) => {
        if (openNotes) {
            setOpenNotes(false);
            eventHandler({
                "updateNotes": {
                    "transaction_id": activeRow.transaction.id,
                    "notes": note
                }
            })
        }
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        console.log("Tags for: ", transaction_id);
        console.log("        : ", tag_list);
        eventHandler({
            'updateTags': {
                'transaction_id': transaction_id,
                'tag_list': tag_list
            }
        });
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const entity_info = {
            id: row.transaction.id,
            tags: row.transaction.tags
        }
        return (<TagSelectorCategoryComponent tagsMap={tagsMap} entity={entity_info} onChange={changeTag}/>);
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
        if (columnIndex === 5) {  // Notes column
            console.log("Setting active row to: ", row.transaction);
            setActiveRow(row);
            e.preventDefault();
            console.log("colNoteEvent: ", activeRow);
            e.stopPropagation();
            setOpenNotes(true);
        }
    }

    // Define table columns
    const columns = []
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

    const assignCategoryToTransaction = (event) => {
        console.log(event);
        eventHandler({
            "updateCategory": {
                "transaction_id": activeRow.transaction.id,
                "category_id": event.value
            }
        });
    }

    const expandRow = {
        onlyOneExpanding: false,
        renderer: (row, rowIndex) => {
            console.log("Expanding: ", rowIndex);
            setActiveRow(row);
            return(<TransactionDetailComponent row={row} eventHandler={assignCategoryToTransaction}/>);
        },
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
                                <Item>Processed Transaction: {activeRow.id}</Item>
                                <Item>Transaction: {activeRow.transaction.id}</Item>
                            </>
                        )}
                    </Menu>
                </Collapsible>
                {openNotes && activeRow && <NoteEditDialog closeHandler={closeModal} entity={activeRow.transaction}/>}
            </div>
        )
    }
}

export default CategoryComponent;
