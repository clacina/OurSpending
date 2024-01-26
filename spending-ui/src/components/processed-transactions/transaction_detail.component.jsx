import React, {useContext, useRef, useState} from "react";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import CategorySelectDialog from "../category-select-dialog/category_select_dialog.component.jsx";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import CreateTemplateDialogComponent from "../widgets/create-template-dialog/create.template.component";
import {ItemTable, SubContent, TransactionDetailContainer} from './transaction_detail.component.styles.jsx';
import 'react-dropdown/style.css';
import Button from "react-bootstrap/Button";

const TransactionDetailComponent = ({row, eventHandler}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const [openCategories, setOpenCategories] = useState(false);
    const [openNotes, setOpenNotes] = useState(false);
    const [openTemplateEditor, setOpenTemplateEditor] = useState(false);
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

    const openCreateTemplate = () => {
        setOpenTemplateEditor(true);
    }

    const closeCreateTemplate = () => {
        setOpenTemplateEditor(false);
    }

    // Sort comparators
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

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
        <TransactionDetailContainer>
            <div id='TransactionDetailHeader'>
                <h2>{row.transaction.institution.name}</h2>
                <SubContent>{row.transaction.id}</SubContent>

                <div id='SetCategoryDiv'>
                    <label id='testCategoryLabel'>Select Category</label>
                    <Select
                        id="categorySelection"
                        ref={categorySelectionRef}
                        closeMenuOnSelect={true}
                        options={options.sort(compareCategories)}
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        onChange={eventHandler}/>
                </div>
            </div>

            <span><Button onClick={openCreateTemplate}>Create Template</Button></span>
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
            {openNotes && <NoteEditDialog closeHandler={closeModal}/>}
            {openTemplateEditor && <CreateTemplateDialogComponent closeHandler={closeCreateTemplate} transaction={row}/>}
        </TransactionDetailContainer>
    );
}

export default TransactionDetailComponent;
