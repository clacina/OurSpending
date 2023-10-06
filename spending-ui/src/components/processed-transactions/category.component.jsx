import React, {useContext, useEffect, useState} from "react";
import {nanoid} from 'nanoid';

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";

import CategoryTitleComponent from "./category-title.component.jsx";
import TransactionDetailComponent from "./transaction_detail.component.jsx";

import ColorizedMultiSelect from "../colorized-multi-select/colorized-multi-select.component.jsx";

import jsLogger from '../../utils/jslogger.js';


const CategoryComponent = ({category, display}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);
    const [activeRow, setActiveRow] = useState(0);
    const uncategorized = category[0].template === null;

    const log = (...args) => {
        jsLogger.custom('category-component', args, 6);
    }

    useEffect(() => {
        if (transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
        } else {
            log("No definitions yet");
        }
    }, [transactionDataDefinitions.length]);

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (<ColorizedMultiSelect tagsMap={tagsMap} transaction={category}/>);
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 4) {  // tags column - it's a drop down
            e.stopPropagation();
        }
        log({e, column, columnIndex, row, rowIndex})
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
        columns.push({dataField: 'transaction.notes', text: 'Notes', style: {cursor: 'pointer'}})
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
            log("Expanding: ", rowIndex);
            return(<TransactionDetailComponent row={row} />);

        },
        // onExpand: handleOnExpand
    }

    const showContext = (event, row) => {
        log("showContext: ", event);
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
        )
    }
}

export default CategoryComponent;
