/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */

import {useContext, useEffect, useState} from "react";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import BootstrapTable from 'react-bootstrap-table-next';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from "react";
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";


const data = {
    "id": 5,
    "credit": false,
    "hint": "Life Insurance",
    "notes": null,
    "category": {
        "id": 21,
        "value": "Service"
    },
    "institution": {
        "id": 1,
        "key": "WLS_CHK",
        "name": "Wellsfargo Checking"
    },
    "tags": [
        {
            "id": 4,
            "value": "Recurring"
        }
    ],
    "qualifiers": [
        {
            "id": 68,
            "value": "AAA LIFE INS PREM",
            "institution_id": 1
        }
    ]
}


const TemplateList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const {templatesMap} = useContext(TemplatesContext);

    useEffect(() => {
        console.log("Start");
        if (templatesMap.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [templatesMap]);

    const templateList = templatesMap.map((t) => {
        return {...t}
    })

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true});
    columns.push({dataField: 'hint', text: 'Hint', sort: true});
    columns.push({dataField: 'credit', text: 'Credit', sort: true});
    columns.push({dataField: 'notes', text: 'Notes', sort: true});
    columns.push({dataField: 'category.value', text: 'Category', sort: true});
    columns.push({dataField: 'institution.name', text: 'Bank', sort: true});

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

    if (isLoaded) {
        return (
            <div>
                <h1>Templates</h1>
                {/*{templateList.map(item => <Template key={item.id} template={item}/>)}*/}
                <BootstrapTable
                    keyField='id'
                    data={templateList}
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
            </div>
        )
    }
};

export default TemplateList;
