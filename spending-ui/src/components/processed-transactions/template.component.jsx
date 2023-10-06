import {nanoid} from 'nanoid';
import React, {useContext, useState} from "react";

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import Collapsible from 'react-collapsible';

import {contextMenu, Item, Menu, Separator, Submenu} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";

import ColorizedMultiSelect from "../colorized-multi-select/colorized-multi-select.component.jsx";

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

    const templateId = templateTransactions[0];
    const templateList = templateTransactions[1];

    const transactions = [];

    const categoryBreakdown = {}
    categoryBreakdown[-1] = []

    // pull transactions from templates
    templateList.forEach((i) => {
        if (i.transaction) {
            const newTrans = i.transaction;
            // Create unique keyid per row
            newTrans.keyid = nanoid();
            transactions.push(i.transaction);
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
            // console.log("Got missing transaction: ", i);
        }
    })


    // Build our title string
    const workingTemplate = templatesMap.find((i) => Number(i.id) === Number(templateId));
    var title = "Template Transactions"
    if (workingTemplate) {
        title = `${workingTemplate.hint} - Template Id: ${templateId}, ${transactions.length} Transactions (${workingTemplate.category.value} )`;
    }

    //-------------- Configure our table -----------------------------
    // Create column definitions for this institution
    const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(bank));
    const columns = [];
    console.log("DD: ", dataDefinition);
    dataDefinition.forEach((x) => {
        if (x.data_id) {
            columns.push({
                dataField: x.data_id, text: x.column_name, sort: true, editable: false
            });
        }
    });

    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<ColorizedMultiSelect tagsMap={tagsMap} transaction={row}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 3) {  // tags column - it's a drop down
            e.stopPropagation();
        }
        console.log({e, column, columnIndex, row, rowIndex})
    }

    columns.push({
        dataField: 'transaction.tags', text: 'Tags', formatter: tagColumnFormatter, events: {
            onClick: colEvent
        }, style: {cursor: 'pointer'}
    })

    columns.push({dataField: 'notes', text: 'Notes'})
    columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})

    console.log(columns)
    const showContext = (event, row) => {
        console.log("showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu", event: event
        });
    };

    const rowEvents = {
        onClick: (e, row, index) => {
            setActiveRow(row);
        }, onContextMenu: (e, row, index) => {
            showContext(e, row);
        }
    };

    return (<Collapsible trigger={title}>
            <BootstrapTable
                keyField='keyid'
                data={transactions}
                columns={columns}
                // cellEdit={cellEdit}
                rowEvents={rowEvents}
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
        </Collapsible>)
}

export default TemplateComponent;
