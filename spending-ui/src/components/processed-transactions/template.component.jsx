import React from "react";
import {useContext, useState} from "react";

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {nanoid} from 'nanoid';

import {StaticDataContext} from "../../contexts/static_data.context";
import {TemplatesContext} from "../../contexts/templates.context.jsx";

const TemplateComponent = ({bank, templateTransactions}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {templatesMap} = useContext(TemplatesContext);
    const [activeRow, setActiveRow] = useState(0);
    const templateId = templateTransactions[0];
    const transactionList = templateTransactions[1];
    const transactions = [];

    // console.table(templateTransactions);

    transactionList.forEach((i) => {
        if(i.transaction) {
            const newTrans = i.transaction;
            // Create unique keyid per row
            newTrans.keyid = nanoid();
            transactions.push(i.transaction);
        } else {
            // console.log("Got missing transaction: ", i);
        }
    })

    // Build our title string
    const workingTemplate = templatesMap.find((i) => Number(i.id) === Number(templateId));
    var title = "Template Transactions"
    if (workingTemplate) {
        title = `${workingTemplate.hint} - (Institution: ${bank}) Template: ${templateId}, ${transactions.length} Transactions `;
    }

    //-------------- Configure our table -----------------------------
    // Create column definitions for this institution
    const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(bank));
    const columns = [];
    dataDefinition.forEach((x) => {
        if(x.data_id) {
            columns.push({
                dataField: x.data_id,
                text: x.column_name,
                sort: true
            });
        }
    });
    columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
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

    return (
        <Collapsible trigger={title}>
            <BootstrapTable
                keyField='keyid'
                data={transactions}
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
        </Collapsible>
    )
}

export default TemplateComponent;
