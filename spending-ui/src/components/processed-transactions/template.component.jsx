import {nanoid} from 'nanoid';
import React, {useContext, useEffect, useState} from "react";

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import Collapsible from 'react-collapsible';

import {contextMenu, Item, Menu, Separator, Submenu} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import "./template.component.styles.css";

import {StaticDataContext} from "../../contexts/static_data.context";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";


import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import TagSelector from "../widgets/tag-selector/tag-selector.component.jsx";
import TransactionDetailComponent from "./transaction_detail.component.jsx";

const TemplateComponent = ({bank, templateTransactions, eventHandler}) => {
    /*
        templateTransactions is an array
        element [0] = template id of group
        element [1] = array of template object
     */
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {templatesMap} = useContext(TemplatesContext);
    const {tagsMap} = useContext(TagsContext);

    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const [title, setTitle] = useState("");
    const [columns, setColumns] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const templateId = templateTransactions[0];
    const templateList = templateTransactions[1];
    const categoryBreakdown = {}
    categoryBreakdown[-1] = []

    useEffect(() => {
        if(templateList.length > 0) {
            // pull transactions from templates
            const trans = []
            templateList.forEach((i) => {
                if (i.transaction) {
                    const newTrans = i.transaction;
                    // Create unique keyid per row
                    newTrans.keyid = nanoid();
                    trans.push(i.transaction);
                    if (typeof i.template === "undefined" || i.template === null) {
                        return;
                    }

                    if (i.template.category === null) {
                        categoryBreakdown[-1].push(i);
                        return;
                    }
                    if (!categoryBreakdown.hasOwnProperty(i.template.category.id)) {
                        categoryBreakdown[i.template.category.id] = []
                    }
                    categoryBreakdown[i.template.category.id].push(i);

                } else {
                    // log("Got missing entity: ", i);
                }
            })
            setTransactions(trans)

            // Build our title string
            const workingTemplate = templatesMap.find((i) => Number(i.id) === Number(templateId));
            var title = `No Matching Template - ${trans.length} Transactions`
            if (workingTemplate) {
                title = `${workingTemplate.hint} - Template Id: ${templateId}, ${trans.length} Transactions (${workingTemplate.category.value} )`;
                if(workingTemplate.credit) {
                    console.log("Found credit template: ", workingTemplate.hint);
                }
            }
            setTitle(title);

            //-------------- Configure our table -----------------------------
            // Create column definitions for this institution
            const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(bank));
            const cols = [];
            dataDefinition.forEach((x) => {
                if (x.data_id) {
                    cols.push({
                        dataField: x.data_id, text: x.column_name, sort: true, editable: true
                    });
                }
            });

            cols.push({
                dataField: 'entity.tags', text: 'Tags', formatter: tagColumnFormatter, events: {
                    onClick: columnEvent
                }, style: {cursor: 'pointer'}
            })

            cols.push({
                dataField: 'entity.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
                    onClick: columnEvent
                }, style: {cursor: 'pointer'}
            })
            cols.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
            setColumns(cols);
            setIsLoaded(true);
        }
    }, [templateList])

    const closeModal = async (id, value, save_result) => {
        console.log("value and save: " + value + " " + save_result);
        if (openNotes) {
            setOpenNotes(false);
            if(save_result) {
                eventHandler({
                    "updateNotes": {
                        "transaction_id": activeRow.id,
                        "notes": value
                    }
                })
            }
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

    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const entity_info = {
            id: row.id,
            tags: row.tags
        }
        return (<TagSelector
                    tagsMap={tagsMap}
                    entity={entity_info}
                    onChange={changeTag}
                    selectorId='tagSelection2'
                    canCreate={true}
        />);
    }

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const note_list = row.notes.map((note) => {
            return(note.note + " ");
        })
        return (<div>{note_list}</div>);
    }

    const columnEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        if (columnIndex === 4) {  // Notes column
            e.preventDefault();
            e.stopPropagation();
            setOpenNotes(true);
        } else if(columnIndex === 3) {  // Tags column
            e.stopPropagation();
        }
    }

    const showContext = (event, row) => {
        console.log("showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu", event: event
        });
    };

    const rowEvents = {
        onContextMenu: (e, row, index) => {
            console.log("row: ", row)
            showContext(e, row);
        }
    };

    const assignCategoryToTransaction = (event) => {
        console.log("act: ", event);
        eventHandler({
            "updateCategory": {
                // "transaction_id": activeRow.transaction.id,
                "transaction_id": activeRow.id,
                "category_id": event.value
            }
        });
    }

    const expandRow = {
        onlyOneExpanding: false,
        renderer: (row, rowIndex) => {
            const transaction = {}
            setActiveRow(row);
            transaction.institution_id = row.institution.id;
            transaction.transaction = row;
            return(<TransactionDetailComponent row={transaction} eventHandler={assignCategoryToTransaction}/>);
        },
    }

    if(isLoaded) {
        return (
            <div>
                <Collapsible trigger={title}>
                    <BootstrapTable
                        keyField='keyid'
                        data={transactions}
                        columns={columns}
                        rowEvents={rowEvents}
                        expandRow={expandRow}
                    />
                    <Menu id="context-menu" theme='dark'>
                        {activeRow && (<>
                            <Item className="text-center">Header row {activeRow.id}</Item>
                            <Separator/>
                            <Item>Processed Transaction: {activeRow.id}</Item>
                            <Item>Transaction: {activeRow.id}</Item>
                        </>)}
                    </Menu>
                </Collapsible>
                {openNotes && activeRow && <NoteEditDialog closeHandler={closeModal} entity={activeRow}/>}
            </div>
        )
    }
}

export default TemplateComponent;
