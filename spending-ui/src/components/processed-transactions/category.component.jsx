import React, {useState} from "react";
import cellEditFactory from "react-bootstrap-table2-editor";

import Collapsible from 'react-collapsible';

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";


const CategoryComponent = ({category}) => {
    const [activeRow, setActiveRow] = useState(0);
    var title = "Not Categorized";
    if(category[0].template) {
        title = category[0].template.category.value;
        console.log("Got category: ", category[0].template.category.value);
    }
    console.log(category);
    //
    // category.forEach((item) => {
    //     console.log("--", item);
    //     if (item.template) {
    //         if (item.template.hasOwnProperty('category')) {
    //             console.log("  ", item.template.category.value);
    //         }
    //     }
    //     if (!item.hasOwnProperty('template')) {
    //         console.log("----No Template");
    //     }
    // })

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
    columns.push({dataField: 'template.hint', text: 'Template'})
    columns.push({dataField: 'template.credit', text: 'Credit'})
    columns.push({dataField: 'transaction.amount', text: 'Amount'})
    columns.push({dataField: 'transaction.transaction_date', text: 'Date'})
    columns.push({dataField: 'transaction.tags', text: 'Tags'})
    columns.push({dataField: 'transaction.notes', text: 'Notes'})
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

    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: (oldValue, newValue, row, column) => {
            console.log("Save Cell ", [oldValue, newValue, row, column]);
        }
    })



    return(
        <Collapsible trigger={title}>
            <BootstrapTable
                keyField='keyid'
                data={category}
                columns={columns}
                cellEdit={cellEdit}
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

export default CategoryComponent;
