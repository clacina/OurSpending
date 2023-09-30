import React, {useContext, useEffect, useState} from "react";
import {nanoid} from 'nanoid';

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import TransactionDetailComponent from "./transaction_detail.component.jsx";

const CategoryComponent = ({category}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const [activeRow, setActiveRow] = useState(0);

    useEffect(() => {
        if(transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
            console.log(category);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length]);

    /*
        category[].template.institution.name
                  .template.id
                  .template.credit
                  .template.hint
                  .transaction.id
                  .transaction.amount
                  .transaction.description
                  .transaction.notes
                  .transaction.tags
                  .transaction.transaction_date
     */

    const columns = []
    columns.push({dataField: 'keyid', text:'', isDummyField: true, hidden: true})
    columns.push({dataField: 'template.hint', text: 'Template', editable: false})
    columns.push({dataField: 'template.credit', text: 'Credit', editable: false})
    columns.push({dataField: 'transaction.amount', text: 'Amount', editable: false})
    columns.push({dataField: 'transaction.transaction_date', text: 'Date', editable: false})
    columns.push({dataField: 'transaction.tags', text: 'Tags'})
    columns.push({dataField: 'transaction.notes', text: 'Notes'})
    columns.push({dataField: 'transaction.id', text: '', hidden: true})

    var title = "Not Categorized";
    if(category[0].template) {
        title = category[0].template.category.value;
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

    const handleOnExpand = (row, isExpand, rowIndex, e) => {
        // console.log({row, isExpand, rowIndex, e});
        // const curData = expanded;
        // console.log('curData: ', curData);
        // console.log("Row: ", row.keyid);
    }

    const handleTransAction = (event) => {
        event.preventDefault();
        alert("Hi");
    }

    const expandRow = {
        onlyOneExpanding: false,
        // showExpandedColumn: true,
        renderer: (row, rowIndex) => {
            return(<TransactionDetailComponent row={row} />);

        },
        // expanded: expanded,
        onExpand: handleOnExpand
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

    // ----------------------- Transaction Data Definitions  ------------------------------
    // const usedInstitutions = [];
    // category.forEach((item) => {
    //     if(!usedInstitutions.includes(item.institution_id)) {
    //         const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === item.institution_id);
    //         const dataNames = dataDefinition.map((column) => column.column_name);
    //         console.log("data names for institution id: " + item.institution_id + ", : " + dataNames);
    //         usedInstitutions.push(item.institution_id);
    //     }
    // })
    // const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === institution_id);
    // const dataNames = dataDefinition.map((column) => column.column_name);


    // ----------------------------------------------------------------

    if(isLoaded) {
        return (
            <Collapsible trigger={title}>
                <BootstrapTable
                    keyField='keyid'
                    data={category}
                    columns={columns}
                    rowEvents={rowEvents}
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
