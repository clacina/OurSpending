/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */

import {useContext, useEffect, useState} from "react";

import Collapsible from 'react-collapsible';
import BootstrapTable from 'react-bootstrap-table-next';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {nanoid} from 'nanoid';

import {StaticDataContext} from "../../contexts/static_data.context";

import paginationFactory from "react-bootstrap-table2-paginator";
import React from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import { Row } from "react-bootstrap";
import filterFactory, {
    Comparator,
    customFilter,
    FILTER_TYPES
} from "react-bootstrap-table2-filter";
import { contextMenu, Item, Menu, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import cellEditFactory from 'react-bootstrap-table2-editor';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";

const ProcessedBatches = () => {

    const {processedBatches} = useContext(StaticDataContext);
    const [activeRow, setActiveRow] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date', sort: true})
    columns.push({dataField: 'notes', text: 'Notes', sort: true})
    columns.push({dataField: 'transaction_batch_id', text: 'Transaction Batch', sort: true})

    useEffect(() => {
        console.log("Start");
        if (processedBatches.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [processedBatches]);

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

    if(isLoaded) {
        return(
            <div>
                <Row>
                    <h1>Processed Batches</h1>
                </Row>
                <Row>
                    <BootstrapTable
                        keyField='id'
                        data={processedBatches}
                        columns={columns}
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

export default ProcessedBatches;
