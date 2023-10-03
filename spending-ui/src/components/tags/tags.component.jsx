import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import cellEditFactory from "react-bootstrap-table2-editor";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TableBaseComponent from '../table-base/table-base.component.jsx';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";


const TagsComponent = () => {
    const {tagsMap} = useContext(TagsContext);
    const [isLoaded, setIsLoaded] = useState(false);

    const [newEntry, setNewEntry] = useState("");
    const [newNotes, setNewNotes] = useState("");

    const resetFormFields = () => {
        setNewEntry("");
        setNewNotes("");
    }

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'value', text: 'Value', sort: true})
    columns.push({dataField: 'notes', text: 'Note', sort: false})

    useEffect(() => {
        console.log("Start");
        if (tagsMap.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [tagsMap]);

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
