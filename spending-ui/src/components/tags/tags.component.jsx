import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import cellEditFactory from "react-bootstrap-table2-editor";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TableBaseComponent from '../table-base/table-base.component.jsx';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";
import reactCSS from 'reactcss'

import {SketchPicker} from 'react-color';


const TagsComponent = () => {
    const {tagsMap, setTagsMap} = useContext(TagsContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [newEntry, setNewEntry] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [selectedTag, setSelectedTag] = useState();

    const resetFormFields = () => {
        setNewEntry("");
        setNewNotes("");
    }

    // -------------------- Event handlers for Tag Edit ---------------------
    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: async (oldValue, newValue, row, column) => {
            console.log("Tag Cell ", [oldValue, newValue, row, column]);
            // newValue is entire string to set
            // row is our data row.id == category id
            // colum == row.dataField == column data field

            const requestOptions = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "value": row.value,
                    "notes": row.notes
                })
            };
            const url = 'http://localhost:8000/resources/tags/' + row.id;
            const response = await fetch(url, requestOptions);
            const str = await response.json();
            console.log("Response: ", str);
        }
    })

    // ------------------- Color Picker Support -----------------------
    const handleColorChange = (color) => {
        const newMap = tagsMap.map((item) => {
            return(item.id === selectedTag ? {...item, color: color.rgb} : item)
        })
        setTagsMap(newMap);
    };

    const handleColorClick = () => {
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClose = (color) => {
        setShowColorPicker(false);
        setSelectedTag(null);
    }

    const handleColorChangeComplete = (color, event) => {
        setShowColorPicker(false);
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${ row.color.r }, ${ row.color.g }, ${ row.color.b }, ${ row.color.a })`,
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={ styles.swatch } onClick={ handleColorClick }>
                    <div style={ styles.color } />
                </div>
                { showColorPicker &&
                    <div style={ styles.popover }>
                        <div style={ styles.cover } onClick={ handleColorClose }/>
                        <SketchPicker
                            color={ row.color }
                            onChangeComplete={handleColorChangeComplete}
                            onChange={ handleColorChange } />
                    </div>
                }
            </div>
        );
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 3) {  // tags column - it's a drop down
            e.stopPropagation();
            setSelectedTag(row.id);
        }

        if(showColorPicker) {
            e.stopPropagation();
        }
    }

    // Create column definitions for display table
    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'value', text: 'Value', sort: true})
    columns.push({dataField: 'notes', text: 'Note', sort: false})
    columns.push({
        dataField: 'color',
        editable: false,
        isDummyField: true,
        text: 'Display Color',
        formatter: tagColumnFormatter,
        events: {
            onClick: colEvent
        },
    })

    useEffect(() => {
        console.log("Start");
        if (tagsMap.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [tagsMap]);

    // -------------------------- Event handlers for New Tag ----------------------------

    function handleChange(event) {
        const {name, value} = event.target;
        if(name === 'newEntry') {
            setNewEntry(value);
        } else if (name === 'newNotes') {
            setNewNotes(value);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();  // don't have form clear screen
        console.log("handleSubmit: ", event);
        console.log("Adding new entry: ", newEntry);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": newEntry,
                "notes": newNotes
            })
        };

        const url = 'http://localhost:8000/resources/tags';
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        console.log("Response: ", str);
        resetFormFields();
    }

    // --------------------------- Render ----------------------------------------
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
                        <FormInput
                            label='Notes'
                            type='text'
                            required
                            onChange={handleChange}
                            name="newNotes"
                            value={newNotes}
                        />
                        <Button type='submit' id='signup submit'>Add</Button>
                    </form>
                </Row>
                <Row>
                    <TableBaseComponent
                        columns={columns}
                        data={tagsMap}
                        keyField='id'
                        cellEdit={cellEdit}
                    />
                </Row>
            </div>
        )
    }
}

export default TagsComponent;
