import {nanoid} from 'nanoid';
import React, {useContext, useEffect, useState} from "react";

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import Collapsible from 'react-collapsible';

import {contextMenu, Item, Menu, Separator, Submenu} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";


import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import TagSelector from "../tag-selector/tag-selector.component.jsx";
import send from "../../utils/http_client.js";
import TransactionDetailComponent from "./transaction_detail.component.jsx";

const TemplateComponent = ({bank, templateTransactions}) => {
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
                    // log("Got missing transaction: ", i);
                }
            })
            setTransactions(trans)

            // Build our title string
            const workingTemplate = templatesMap.find((i) => Number(i.id) === Number(templateId));
            var title = "Template Transactions"
            if (workingTemplate) {
                title = `${workingTemplate.hint} - Template Id: ${templateId}, ${transactions.length} Transactions (${workingTemplate.category.value} )`;
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
                dataField: 'transaction.tags', text: 'Tags', formatter: tagColumnFormatter, events: {
                    // onClick: colEvent
                }, style: {cursor: 'pointer'}
            })

            cols.push({
                dataField: 'transaction.notes', text: 'Notes', formatter: noteColumnFormatter, events: {
                    onClick: colNoteEvent
                }, style: {cursor: 'pointer'}
            })
            cols.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
            setColumns(cols);
            setIsLoaded(true);
        }
    }, [templateList])

    const closeModal = async (note) => {
        console.log("Closed with: ", typeof note);
        if (openNotes) {
            setOpenNotes(false);
            console.log("Got notes: ", note);
            if (note !== undefined) {
                console.log("Processing note...")
                var body = []
                note.forEach((item) => {
                    body.push({"id": item.id, "text": item.text})
                })

                const headers = {'Content-Type': 'application/json'}
                const url = 'http://localhost:8000/resources/transaction/' + activeRow.id + '/notes';
                const method = 'POST';
                const request = await send({url}, {method}, {headers}, {body});
                console.log("Response: ", request);
            }
        }
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        // console.log("Tags for: ", transaction_id);
        // console.log("        : ", tag_list);
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

    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<TagSelector tagsMap={tagsMap} transaction={row} onChange={changeTag}/>);
    }

    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const note_list = row.notes.map((note) => {
            return(note.note + " ");
        })
        return (<div>{note_list}</div>);
    }

    const colNoteEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        if (columnIndex === 4) {  // Notes column
            e.preventDefault();
            console.log("colNoteEvent: ", activeRow);
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
            showContext(e, row);
        }
    };

    const expandRow = {
        onlyOneExpanding: false,
        renderer: (row, rowIndex) => {
            /*
            {
                const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === row.institution_id);
                    line.value = row.transaction.transaction_data[i];


                "id": 817,
                "batch_id": 5,
                "institution": {
                    "id": 3,
                        "key": "CONE_VISA",
                        "name": "Capital One Visa",
                        "notes": null
                },
                "transaction_date": "2023-01-02",
                "transaction_data": [
                    "2023-01-02",
                    "2023-01-03",
                    "7776",
                    "Amazon web services",
                    "Other Services",
                    "1.76",
                    ""
                ],
                "tags": [],
                "description": "Amazon web services",
                "amount": -1.76,
                "notes": [],
                "category": null,
                "keyid": "UKxBr_dbR9TOjkIGVMBjp"
            }
            */
            const transaction = {}
            transaction.institution_id = row.institution.id;
            transaction.transaction = row;

            console.log("Expanding: ", rowIndex);
            console.log("Row: ", row);
            return(<TransactionDetailComponent row={transaction} />);

        },
        // onExpand: handleOnExpand
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
                            {["Google", "Apple"].includes("Google") && (<Submenu label="Contact" arrow=">">
                                <Item>Phone</Item>
                                <Item>Email</Item>
                            </Submenu>)}
                            <Item disabled={true}>Add to Cart</Item>
                        </>)}
                    </Menu>
                </Collapsible>
                {openNotes && activeRow && <NoteEditDialog closeHandler={closeModal} transaction={activeRow}/>}
            </div>
        )
    }
}

export default TemplateComponent;
