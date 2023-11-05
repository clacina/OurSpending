import React, {useContext, useRef, useState} from "react";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import CategorySelectDialog from "../category-select-dialog/category_select_dialog.component.jsx";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import {ItemTable, sub_format} from './transaction_detail.component.styles.jsx';
import 'react-dropdown/style.css';

const TransactionDetailComponent = ({row, eventHandler}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const [openCategories, setOpenCategories] = useState(false);
    const [openNotes, setOpenNotes] = useState(false);
    const categorySelectionRef = useRef();

    const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === row.institution_id);
    const tableDef = []
    for(let i=0;i<dataDefinition.length;i++) {
        const line = {}
        line.title = dataDefinition[i].column_name;
        line.value = row.transaction.transaction_data[i];
        tableDef.push(line);
    }

    // Format categories selector
    const options = [];
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    // Sort comparators
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    // const updateCategory = (event) => {
    //     console.log("updateCategory: ", event);
    //     // event contains an array of active entries in the select
    //     eventHandler(event);
    // }

    // const showModal = () => {
    //     setOpenCategories(true);
    // }
    //
    // const showNotes = () => {
    //     setOpenNotes(true);
    // }

    const closeModal = (props) => {
        console.log("Closed with: ", props);
        if(openCategories) {
            setOpenCategories(false);
            if (typeof props === 'number') {
                // got category id
                console.log("Assign category: ", props);
            }
        } else if(openNotes) {
            setOpenNotes(false);
            console.log(props);
            if (typeof props === 'string') {
                console.log("Add note: ", props);
            }
        }
    }

    return(
        <div>
            <h2>{row.transaction.institution.name}</h2>
            <sub_format>{row.transaction.id}</sub_format>

            <Select
                id="categorySelection"
                ref={categorySelectionRef}
                closeMenuOnSelect={true}
                options={options.sort(compareCategories)}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={eventHandler}/>

            {/*<span><button onClick={showModal}>Assign Category</button></span>*/}
            {/*<span><button>Create Template</button></span>*/}
            <ItemTable>
                <thead>
                    <tr>
                        <td>Field</td>
                        <td>Value</td>
                    </tr>
                </thead>
                <tbody>
                    {tableDef.map((item) => {
                        return(<tr><td>{item.title}</td><td>{item.value}</td></tr>);
                    })}
                </tbody>
            </ItemTable>
            {openCategories && <CategorySelectDialog row={row} closeHandler={closeModal}/>}
            {openNotes && <NoteEditDialog closeHandler={closeModal} />}
        </div>
    );
}

export default TransactionDetailComponent;
