import React, {useState} from "react";
import cellEditFactory from "react-bootstrap-table2-editor";
import {nanoid} from 'nanoid';

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
        // console.log("Got category: ", category[0].template.category.value);
    }
    // console.log(category);

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

    const [expanded, setExpanded] = useState([]);

    category.forEach((item) => {
        item.keyid = nanoid();
    })

    // const handleBtnClick = () => {
    //     if (!expanded.includes(2)) {
    //         const curData = expanded;
    //         setExpanded({expanded: [...expanded, 2]});
    //     } else {
    //         setExpanded({expanded: expanded.filter(x => x !== 2)});
    //     }
    // }

    const handleOnExpand = (row, isExpand, rowIndex, e) => {
        console.log({row, isExpand, rowIndex, e});
        const curData = expanded;
        console.log('curData: ', curData);
        console.log("Row: ", row.keyid);

        if (isExpand && !curData.includes(row.keyid)) {
            setExpanded([...curData, row.keyid]);
        } else {
            setExpanded(curData.filter(x => x !== row.keyid));
        }
    }

    // ----------------------------------------------------------------


    const expandRow = {
        onlyOneExpanding: false,
        // showExpandedColumn: true,
        renderer: (row, rowIndex) => {
            return(
                <div>{row.keyid}</div>
            )
        },
        expanded: expanded,
        // onExpand: handleOnExpand
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

    return(
        <Collapsible trigger={title}>
            <BootstrapTable
                keyField='keyid'
                data={category}
                columns={columns}
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
        </Collapsible>
    )
}

export default CategoryComponent;
