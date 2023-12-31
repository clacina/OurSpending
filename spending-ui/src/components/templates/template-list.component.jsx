/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */

import {useContext, useEffect, useState} from "react";
import '../collapsible.scss';

import {StaticDataContext} from "../../contexts/static_data.context";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from "react";
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import send from "../../utils/http_client.js";
import TagSelectorCategoryComponent from "../widgets/tag-selector/tag-selector-category.component.jsx";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component.jsx";
import TemplateDetailComponent from "./template.component.jsx";
import './template-list.component.styles.css';

const TemplateList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [editColumn, setEditColumn] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")
    const [editContent, setEditContent] = useState("");

    const {setSectionTitle} = useContext(StaticDataContext);
    const {templatesMap, setUpdate} = useContext(TemplatesContext);
    const {tagsMap} = useContext(TagsContext);

    useEffect(() => {
        console.log("Start");
        if (templatesMap.length > 0 && tagsMap.length > 0) {
            setSectionTitle('Templates');
            setIsLoaded(true);
            console.log("TList: ", templatesMap)
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
        const method = 'PATCH'
        console.log("Sending update: ", body);
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
        setUpdate(true);
    }

    const updateTags = async (template_id, tag_list) => {
        var body = {tags: []}
        console.log("tag_list: ", tag_list);
        tag_list.forEach((item) => {
            body.tags.push({id:item.value, value:item.label, color:item.color, notes:item.notes});
        })
        await callUpdate(template_id, body);
    }

    const updateNotes = async (template_id, note) => {
        const body = {
            'notes': note
        }
        await callUpdate(template_id, body);
    }

    const updateHint = async (template_id, hint) => {
        const body = {
            'hint': hint
        }
        await callUpdate(template_id, body);
    }

    const updateCategory = async (template_id, category) => {
        console.log("Sending category: ", category);
        const body = {
            'category': category
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
                        await updateHint(id, value);
                        break;
                    case 2: // credit
                        await updateCredit(id, value);
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

    const detailEventHandler = (event) => {
        console.log('dt: ', event);
        updateCategory(event.template_id, event.category);
    }

    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
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
        return (<TagSelectorCategoryComponent tagsMap={tagsMap.sort(compareTags)} entity={entity_info} onChange={updateTags}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        console.log("Click col: ", columnIndex);
        console.log("Click row: ", rowIndex);
        console.log("Row: ", row);
        switch (columnIndex) {
            case 1: // hint
                console.log("Edit hint: ", row.notes);
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(1);
                setEditTitle("Template Hint");
                setEditPrompt("text");
                setEditContent(row.hint);
                setOpenNotes(true);
                break;
            case 2: // credit
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(2);
                setEditPrompt("check");
                setEditTitle("Template Credit");
                setEditContent(row.credit);
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
                setEditContent(row.notes);
                setOpenNotes(true);
                break;
            default:
                break
        }
    }

    // Setup Columns
    const headerBackgroundColor = '#008080'
    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'100px',
        }
    });
    columns.push({dataField: 'hint', text: 'Hint', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'credit', text: 'Credit', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'100px',
        },
        events: {
        onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({
        dataField: 'entity.tags',
        text: 'Tags',
        formatter: tagColumnFormatter,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colEvent
        },
        style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'notes', text: 'Notes',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    });
    columns.push({dataField: 'category.value', text: 'Category', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'},
    });
    columns.push({dataField: 'institution.name', text: 'Bank', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'},
    });
    columns.push({dataField: 'category.is_tax_deductible', text: 'Tax Deductible', sort: true,
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'100px',
        },
        events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'},
    });

    const expandRow = {
        onlyOneExpanding: false,
        showExpandColumn: false,
        renderer: (row, rowIndex) => {
            console.log(row);
            return(<TemplateDetailComponent template={row} eventHandler={detailEventHandler}/>);
        },
    }

    if (isLoaded) {
        return (
            <div id='templateListContainer'>
                <p>Click the 'Id' column to see the qualifiers for a given template.</p>
                <p>Click any other column to edit that value.</p>
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
                                                content={editContent}
                                                title={editTitle}
                                                prompt_type={editPrompt}
                                                entity_id={activeRow.id}/>
                }
            </div>
        )
    }
};

export default TemplateList;
