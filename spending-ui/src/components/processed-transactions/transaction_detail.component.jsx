import React, {useContext, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import CategorySelectDialog from "../category-select-dialog/category_select_dialog.component.jsx";
import NoteEditDialog from "../note-edit-dialog/note_edit_dialog.component.jsx";
import {ItemTable} from './transaction_detail.component.styles.jsx';
import 'react-dropdown/style.css';

const TransactionDetailComponent = ({row}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const [openCategories, setOpenCategories] = useState(false);
    const [openNotes, setOpenNotes] = useState(false);

    const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === row.institution_id);
    const tableDef = []
    for(let i=0;i<dataDefinition.length;i++) {
        const line = {}
        line.title = dataDefinition[i].column_name;
        line.value = row.transaction.transaction_data[i];
        tableDef.push(line);
    }

    const showModal = () => {
        setOpenCategories(true);
    }

    const showNotes = () => {
        setOpenNotes(true);
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
        <div>
            <h2>{row.transaction.institution.name}</h2>
            <span><button onClick={showModal}>Assign Category</button></span>
            <span><button>Create Template</button></span>
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
