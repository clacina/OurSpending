/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */

import {useContext, useEffect, useState} from "react";
import '../collapsible.scss';
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import BootstrapTable from 'react-bootstrap-table-next';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from "react";
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import send from "../../utils/http_client.js";
import TagSelectorCategoryComponent from "../tag-selector/tag-selector-category.component.jsx";
import ModalPromptComponent from "../modal-prompt/modal-prompt.component.jsx";
import TemplateDetailComponent from "../template/template.component.jsx";


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
    const [editColumn, setEditColumn] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")

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
    const callUpdate = async (template_id, body) => {
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/template/' + template_id;
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    const updateTags = async (template_id, tag_list) => {
        var body = {tags: []}
        tag_list.forEach((item) => {
            body.tags.push(item.value);
        })
        await callUpdate(template_id, body);
    }

    const updateNotes = async (template_id, note) => {
        const body = {
            notes: note
        }

        await callUpdate(template_id, body);
    }

    const updateHint = async (template_id, hint) => {
        const body = {
            hint: hint
        }

        await callUpdate(template_id, body);
    }

    const updateCategory = async (template_id, category_id) => {
        const body = {
            'category_id': category_id
        }
        await callUpdate(template_id, body);
    }

    const updateCredit = async (template_id, is_credit) => {
        const body = {
            'credit': is_credit
        }
        await callUpdate(template_id, body);
    }

    //-------------------- Event Handlers ---------------------------------
    const closeModal = async (id, note, save_result) => {
        if (openNotes) {
            console.log("Close notes: ", note);
            setOpenNotes(false);
            if(save_result) {
                console.log("---Saving: ", editColumn);
                switch(editColumn) {
                    case 1: // hint
                        await updateHint(id, note);
                        break;
                    case 2: // credit
                        await updateCredit(id, note);
                        break;
                    case 4: // notes
                        await updateNotes(id, note);
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

    const detailEventHandler = (event) => {

    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const entity_info = {
            id: row.id,
            tags: row.tags
        }
        return (<TagSelectorCategoryComponent tagsMap={tagsMap} entity={entity_info} onChange={updateTags}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        console.log("Click col: ", columnIndex);
        switch (columnIndex) {
            case 1: // hint
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(1);
                setEditTitle("Template Hint");
                setEditPrompt("text");
                setOpenNotes(true);
                break;
            case 2: // credit
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(2);
                setEditPrompt("check");
                setEditTitle("Template Credit");
                setOpenNotes(true);
                break;
            case 3: // tags
                e.preventDefault();
                e.stopPropagation();
                break;
            case 4: // notes
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(4);
                setEditPrompt("text");
                setEditTitle("Template Note");
                setOpenNotes(true);
                break;
            case 5: // category
                e.preventDefault();
                e.stopPropagation();
                break;
            default:
                break
        }
    }

    // Setup Columns
    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true});
    columns.push({dataField: 'hint', text: 'Hint', sort: true, events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'credit', text: 'Credit', sort: true, events: {
        onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({
        dataField: 'entity.tags',
        text: 'Tags',
        formatter: tagColumnFormatter,
        events: {
            onClick: colEvent
        },
        style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'notes', text: 'Notes', events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'category.value', text: 'Category', sort: true, events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'institution.name', text: 'Bank', sort: true});

    const expandRow = {
        onlyOneExpanding: false,
        showExpandColumn: false,
        renderer: (row, rowIndex) => {
            return(<TemplateDetailComponent template={row} eventHandler={detailEventHandler}/>);
        },
    }

    if (isLoaded) {
        return (
            <div>
                <h1>Templates</h1>
                <BootstrapTable
                    keyField='id'
                    data={templateList}
                    columns={columns}
                    rowEvents={rowEvents}
                    expandRow={expandRow}
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
                                                title={editTitle}
                                                prompt_type={editPrompt}
                                                entity_id={activeRow.id}/>
                }
            </div>
        )
    }
};

export default TemplateList;
