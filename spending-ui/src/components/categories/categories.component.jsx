import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import TableBaseComponent from '../table-base/table-base.component.jsx';

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";
import {CategoriesContext} from "../../contexts/categories.context.jsx";

const CategoriesComponent = () => {
    const {categoriesMap} = useContext(CategoriesContext);
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
        if (categoriesMap.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [categoriesMap]);

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

    if (isLoaded) {
        return (
            <div>
                <Row>
                    <h1>Categories</h1>
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
                    <TableBaseComponent columns={columns} data={categoriesMap} keyField='id'/>
                </Row>
            </div>
        )
    }
}

export default CategoriesComponent;
