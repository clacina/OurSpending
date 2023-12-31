import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import cellEditFactory from "react-bootstrap-table2-editor";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';

import Button from "react-bootstrap/Button";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context";

import './categories.component.styles.css';

const CategoriesComponent = () => {
    const {categoriesMap, addCategory, updateCategory} = useContext(CategoriesContext);
    const {setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [newEntry, setNewEntry] = useState("");
    const [newNotes, setNewNotes] = useState("");

    const resetFormFields = () => {
        setNewEntry("");
        setNewNotes("");
    }

    const headerBackgroundColor = '#008080'
    const columns = [];
    columns.push(
        {
            dataField: 'id',
            text: 'Id',
            sort: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width:'100px',
            }
        })
    columns.push(
        {
            dataField: 'value',
            text: 'Category Name',
            sort: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width:'600px',
            },
            style: {cursor: 'pointer'}
        })
    columns.push(
        {
            dataField: 'notes',
            text: 'Notes',
            sort: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            style: {cursor: 'pointer'}
        })

    useEffect(() => {
        console.log("Start");
        if (categoriesMap.length !== 0) {
            setSectionTitle('Categories');
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [categoriesMap]);

    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: async (oldValue, newValue, row, column) => {
            updateCategory(row.id, row.value, row.notes);
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
        addCategory(newEntry, newNotes);
        resetFormFields();
    }

    if (isLoaded) {
        return (
            <div id='categoryContainer'>
                <p>Use the fields below to create a new Category.</p>
                    <form>
                        <div id='category_form_container'>
                            <label className='category_form_label'>New Category</label>
                            <input
                                type='text'
                                id='newEntry'
                                required
                                onChange={handleChange}
                                name="newEntry"
                                value={newEntry}
                            />
                            <label className='category_form_label'>Notes</label>
                            <input
                                type='text'
                                required
                                id='newNotes'
                                onChange={handleChange}
                                name="newNotes"
                                value={newNotes}
                            />
                            <Button id="addCategoryButton" onClick={handleSubmit} className="mb-md-1">Add Category</Button>
                        </div>
                    </form>
                <hr/>
                <p>Click on any cell to edit that value.</p>
                <TableBaseComponent
                    columns={columns}
                    data={categoriesMap}
                    keyField='id'
                    cellEdit={cellEdit}
                />
            </div>
        )
    }
}

export default CategoriesComponent;
