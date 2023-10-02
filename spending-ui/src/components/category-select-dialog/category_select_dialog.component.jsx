import React, {useContext, useState} from "react";
import {Row} from "react-bootstrap";
import ReactModal from "react-modal";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {CButton} from "../processed-transactions/transaction_detail.component.styles.jsx";

const CategorySelectDialog = ({closeHandler}) => {
    const {categoriesMap} = useContext(CategoriesContext);
    const [selection, setSelection] = useState();

    const customStyles = {
        content: {
            top: '100px',
            left: '200px',
            right: 'auto',
            bottom: '400px',
        },
    };

    const assignCategory = () => {
        closeHandler(selection);
    }

    const updateCategory = (event) => {
        console.log("Update Category: ", typeof event);
        setSelection(event.value);
    }

    // Format list
    const options = []
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    return (
        <div>
            <ReactModal
                isOpen={true}
                onRequestClose={closeHandler}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
            >
                <Row>
                    <h2>Assign a Category</h2>
                    <Select
                        options={options}
                        onChange={updateCategory}
                    />
                </Row>
                <Row>
                    <CButton
                        id='assign'
                        onClick={assignCategory}>Assign</CButton>
                </Row>
            </ReactModal>

        </div>
    )
}

export default CategorySelectDialog;
