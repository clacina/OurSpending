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
import {TagsContext} from "../../contexts/tags.context.jsx";
import cellEditFactory from 'react-bootstrap-table2-editor';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";


const TagsComponent = () => {
    const {tagsMap} = useContext(TagsContext);
    const [activeRow, setActiveRow] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const [newEntry, setNewEntry] = useState("");

    const resetFormFields = () => {
        setNewEntry("");
    }

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'value', text: 'Value', sort: true})

    useEffect(() => {
        console.log("Start");
        if (tagsMap.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [tagsMap]);

    const rowStyle = (row) => {
        if (row === activeRow) {
            return {
                backgroundColor: "lightcyan",
                border: "solid 2px grey",
                color: "purple"
            };
        }
    };

    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: (oldValue, newValue, row, column) => {
            console.log("Save Cell ", [oldValue, newValue, row, column]);
        }
    })

    function handleChange(event) {
        const {name, value} = event.target;
        setNewEntry(value);
    }

    async function handleSubmit(event) {
        event.preventDefault();  // don't have form clear screen
        console.log("handleSubmit: ", event);
        console.log("Adding new entry: ", newEntry);
        resetFormFields();

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
                <Row>
                    <h1>Tags</h1>
                </Row>
                <Row>
                    <form onSubmit={handleSubmit}>
                        <FormInput
                            label='New Value'
                            type='text'
                            required
                            onChange={handleChange}
                            name="newEntry"
                            value={newEntry}
                        />
                        <Button type='submit' id='signup submit'>Add</Button>
                    </form>
                </Row>
                <Row>
                    <BootstrapTable
                        keyField='id'
                        data={tagsMap}
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

export default TagsComponent;
