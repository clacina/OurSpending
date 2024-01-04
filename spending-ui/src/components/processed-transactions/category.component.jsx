import React, {useContext, useEffect, useState} from "react";
import {nanoid} from 'nanoid';

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TagSelectorCategoryComponent from "../widgets/tag-selector/tag-selector-category.component.jsx";
import CategoryTitleComponent from "./category-title.component.jsx";
import TransactionDetailComponent from "./transaction_detail.component.jsx";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component";


const CategoryComponent = ({category, eventHandler}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [isCategorized, setIsCategorized] = useState(true);
    const [editContent, setEditContent] = useState([]);

    // console.log("cat: ", category);
    // console.log("temp: ", category[0].template_id)
    // console.log("trans: ", category[0])

    // Define table columns
    const columns = []

    useEffect(() => {
        if (transactionDataDefinitions.length !== 0) {
            if(category.length > 0) {
                if(category[0].template === null && category[0].transaction.category === null) {
                    setIsCategorized(false);
                }
            }
            // Create unique id for each row
            category.forEach((item) => {
                item.keyid = nanoid();
            })
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
        return (<TagSelectorCategoryComponent
                    tagsMap={tagsMap}
                    entity={entity_info}
                    onChange={changeTag}
                    canCreate={true}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 4 || columnIndex === 3) {  // Notes column, tags column - it's a drop down
            e.stopPropagation();
        }
        // console.log({e, column, columnIndex, row, rowIndex})
    }

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const note_list = row.transaction.notes.map((note) => {
            return(note.note + " ");
        })
        return (<div>{note_list}</div>);
    }

    const columnOneFormater = (cell, row, rowIndex, formatExtraData) => {
        return(row.transaction.institution.name);
    }

    const columnTwoFormater = (cell, row, rowIndex, formatExtraData) => {
        if(row.transaction) {
            return(row.transaction.description);
        }
        return("--")
    }

    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 4) {  // Notes column
            setActiveRow(row);
            e.preventDefault();
            e.stopPropagation();
            setOpenNotes(true);
        }
    }

    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2));
    }

    const generateColumns = () => {
        // console.log("Generating columns: ", isCategorized);
        const headerBackgroundColor = '#008080'
        if(!isCategorized) {
            columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
            columns.push({
                dataField: 'template.hint',
                text: 'Bank',
                editable: false,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                headerAttrs: {
                    width:'250px',
                },
                formatter: columnOneFormater,
                style: {cursor: 'pointer'}
            })

            columns.push({dataField: 'template.credit',
                text: 'Description',
                editable: false,
                sort: true,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                style: {cursor: 'pointer'}
            , formatter: columnTwoFormater})
            columns.push({dataField: 'transaction.amount', text: 'Amount', editable: false,
                sort: true,
                align: 'right',
                headerAttrs: {
                    width:'100px',
                },
                formatter: amountColumnFormatter,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                style: {cursor: 'pointer'}})
            columns.push({
                dataField: 'transaction.transaction_date',
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                align: 'right',
                headerAttrs: {
                    width:'150px',
                },
                style: {cursor: 'pointer'},
                text: 'Date',
                sort: true,
                editable: false
            })
            columns.push({
                dataField: 'transaction.tags',
                text: 'Tags',
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                align: 'right',
                headerAttrs: {
                    width:'350px',
                },
                formatter: tagColumnFormatter,
                events: {
                    onClick: colEvent
                },
                style: {cursor: 'pointer'}
            })
            columns.push({
                dataField: 'transaction.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
                    onClick: colNoteEvent
                },
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                style: {cursor: 'pointer'}
            })
            columns.push({dataField: 'transaction.id', text: '', hidden: true})
        } else {
            columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
            columns.push({dataField: 'transaction.institution.name', text: 'Bank', ediatable: false,
                sort: true,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                headerAttrs: {
                    width:'250px',
                },
                style: {cursor: 'pointer'}})
            columns.push({dataField: 'transaction.amount', text: 'Amount', editable: false,
                sort: true,
                formatter: amountColumnFormatter,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                align: 'right',
                headerAttrs: {
                    width:'150px',
                },
                style: {cursor: 'pointer'}})
            columns.push({
                dataField: 'transaction.transaction_date',
                style: {cursor: 'pointer'},
                text: 'Date',
                sort: true,
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                align: 'right',
                headerAttrs: {
                    width:'150px',
                },
                editable: false
            })
            columns.push({
                dataField: 'transaction.tags',
                text: 'Tags',
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                headerAttrs: {
                    width:'450px',
                },
                formatter: tagColumnFormatter,
                events: {
                    onClick: colEvent
                },
                style: {cursor: 'pointer'}
            })
            columns.push({
                dataField: 'transaction.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
                    onClick: colNoteEvent
                },
                headerStyle: {
                    backgroundColor: headerBackgroundColor,
                    color: 'white'
                },
                style: {cursor: 'pointer'}
            })
            columns.push({dataField: 'transaction.id', text: '', hidden: true})
        }
    }

    // ----------------------- On Click Handlers ------------------------------

    const rowEvents = {
        onContextMenu: (e, row, index) => {
            e.stopPropagation();
            showContext(e, row);
        }
    };

    const assignCategoryToTransaction = (event) => {
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
            setActiveRow(row);
            return(<TransactionDetailComponent row={row} eventHandler={assignCategoryToTransaction}/>);
        },
    }

    const showContext = (event, row) => {
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
        generateColumns();
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
