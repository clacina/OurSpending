import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TableBaseComponent from '../table-base/table-base.component.jsx';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";


const TagsComponent = () => {
    const {tagsMap} = useContext(TagsContext);
    const [isLoaded, setIsLoaded] = useState(false);

    const [newEntry, setNewEntry] = useState("");

    const resetFormFields = () => {
        setNewEntry("");
    }

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
                    <TableBaseComponent columns={columns} data={tagsMap} keyField='id'/>
                </Row>
            </div>
        )
    }
}

export default TagsComponent;
