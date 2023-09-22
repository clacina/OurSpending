/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */
import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import { Row } from "react-bootstrap";
import {StaticDataContext} from "../../contexts/static_data.context";

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";

const BanksComponent = () => {
    const {institutions} = useContext(StaticDataContext);
    const [activeRow, setActiveRow] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'key', text: 'Key', sort: true})
    columns.push({dataField: 'name', text: 'Name', sort: true})

    useEffect(() => {
        console.log("Start");
        if (institutions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [institutions]);

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

    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: (oldValue, newValue, row, column) => {
            console.log("Save Cell ", [oldValue, newValue, row, column]);
        }
    })

    const rowEvents = {
        onClick: (e, row, index) => {
            setActiveRow(row);
        },
        onContextMenu: (e, row, index) => {
            showContext(e, row);
        }
    };

    if(isLoaded) {
        return (
            <div>
                <Row>
                    <h1>Banks</h1>
                </Row>
                <Row>
                    <BootstrapTable
                        keyField='id'
                        data={institutions}
                        columns={columns}
                        cellEdit={cellEdit}
                        rowEvents={rowEvents}
                        rowStyle={rowStyle}
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
                </Row>
            </div>
        )
    }
}

export default BanksComponent;
