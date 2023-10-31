/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */

import {useContext, useEffect, useState} from "react";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import BootstrapTable from 'react-bootstrap-table-next';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from "react";
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import send from "../../utils/http_client.js";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import TagSelectorCategoryComponent from "../tag-selector/tag-selector-category.component.jsx";
import ModalPromptComponent from "../modal-prompt/modal-prompt.component.jsx";


const data = {
    "id": 5,
    "credit": false,
    "hint": "Life Insurance",
    "notes": null,
    "category": {
        "id": 21,
        "value": "Service"
    },
    "institution": {
        "id": 1,
        "key": "WLS_CHK",
        "name": "Wellsfargo Checking"
    },
    "tags": [
        {
            "id": 4,
            "value": "Recurring"
        }
    ],
    "qualifiers": [
        {
            "id": 68,
            "value": "AAA LIFE INS PREM",
            "institution_id": 1
        }
    ]
}


const TemplateList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const {templatesMap} = useContext(TemplatesContext);
    const {tagsMap} = useContext(TagsContext);

    useEffect(() => {
        console.log("Start");
        if (templatesMap.length > 0 && tagsMap.length > 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [templatesMap]);

    const templateList = templatesMap.map((t) => {
        return {...t}
    })


    //------------------------------ Server Callback ------------------------
    const updateTags = async (transaction_id, tag_list) => {
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

    const updateNotes = async (template_id, note) => {
        const body = {
            notes: note
        }

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/template/' + template_id;
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    const updateCategory = async (transaction_id, category_id) => {
        const body = {
            'category_id': category_id
        }
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/category';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }


    //---------------------------- Event Handlers ------------------------
    const closeModal = async (id, note, save_result) => {
        if (openNotes) {
            console.log("Close notes: ", note);
            setOpenNotes(false);
            if(save_result) {
                console.log("---Saving");
                await updateNotes(id, note);
            }
        }
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        console.log("Tags for: ", transaction_id);
        console.log("        : ", tag_list);
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const test_entity = {
            id: 2,
            tags: []
        }
        return (<TagSelectorCategoryComponent tagsMap={tagsMap} entity={test_entity} onChange={changeTag}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 3) {  // tags column - it's a drop down
            e.stopPropagation();
        }
        console.log({e, column, columnIndex, row, rowIndex})
    }

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<div>{row.notes}</div>);
    }

    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        if (columnIndex === 4) {  // Notes column
            e.preventDefault();
            console.log("colNoteEvent: ", activeRow);
            e.stopPropagation();
            setOpenNotes(true);
        }
    }

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true});
    columns.push({dataField: 'hint', text: 'Hint', sort: true});
    columns.push({dataField: 'credit', text: 'Credit', sort: true});
    columns.push({
        dataField: 'entity.tags',
        text: 'Tags',
        formatter: tagColumnFormatter,
        events: {
            onClick: colEvent
        },
        style: {cursor: 'pointer'}
    })
    columns.push({dataField: 'entity.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
            onClick: colNoteEvent
        }, style: {cursor: 'pointer'}
    })
    columns.push({dataField: 'category.value', text: 'Category', sort: true});
    columns.push({dataField: 'institution.name', text: 'Bank', sort: true});

    const rowStyle = (row) => {
        if (row === activeRow) {
            return {
                backgroundColor: "lightcyan",
                border: "solid 2px grey",
                color: "purple"
            };
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

    const rowEvents = {
        onClick: (e, row, index) => {
            setActiveRow(row);
        },
        onContextMenu: (e, row, index) => {
            showContext(e, row);
        }
    };

    if (isLoaded) {
        return (
            <div>
                <h1>Templates</h1>
                <BootstrapTable
                    keyField='id'
                    data={templateList}
                    columns={columns}
                    rowEvents={rowEvents}
                    rowStyle={rowStyle}
                />
                <Menu id="context-menu" theme='dark'>
                    {activeRow && (
                        <>
                            <Item className="text-center">Header row {activeRow.id}</Item>
                            <Separator />
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
                {
                    openNotes && activeRow && <ModalPromptComponent
                                                closeHandler={closeModal}
                                                content={activeRow.notes}
                                                entity_id={activeRow.id}/>
                }
            </div>
        )
    }
};

export default TemplateList;
