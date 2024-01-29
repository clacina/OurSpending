import React, {useContext, useEffect, useRef, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import './create.template.dialog.styles.jsx';
import './create.template.component.styles.css';

import Select from "react-select";
import Form from "react-bootstrap/Form";
import {confirmAlert} from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';
import {CategoriesContext} from "../../../contexts/categories.context";
import {ExistingQualifierList, InstitutionName} from "./create.template.dialog.styles";
import {StaticDataContext} from "../../../contexts/static_data.context";
import {InstitutionsContext} from "../../../contexts/banks.context";
import {QualifiersContext} from "../../../contexts/qualifiers.context";

import Jslogger from "../../../utils/jslogger";
/*
    Template Fields to capture:
    - Hint - Str
    - Is Credit - Bool
    - Notes - Str
    - Category - Dropdown
    - Tax Deductible - Bool

    - List of qualifiers
        POST /qualifiers - creates the qualifier record.  We still need to attach it the template
        .. which isn't created yet?
        POST /templates

    - UI Captures all data including qualifiers and makes the changes at once
        Creates the template and gets the new ID
        Creates all the qualifiers
        Attaches the qualifiers to the new template
            PATCH /template/template_id
 */

const CreateTemplateDialogComponent = ({closeHandler, transaction}) => {
    const {institutionsMap} = useContext(InstitutionsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {createQualifier} = useContext(QualifiersContext);

    const [isOpen, setIsOpen] = useState(true);

    const categorySelectionRef = useRef();
    const [isTaxDeductible, setIsTaxDeductible] = useState(false);
    const [isCredit, setIsCredit] = useState(false);
    const [hintText, setHintText] = useState("");
    const [notesText, setNotesText] = useState("");
    const [fieldOptions, setFieldOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [institutionName, setInstitutionName] = useState("");

    // Qualifiers ----------------------------------------------
    const [qualifiers, setQualifiers] = useState([]);
    const [qualifierPhrase, setQualifierPhrase] = useState("");
    const [qualifierField, setQualifierField] = useState();
    const qualifierSelectionRef = useRef();

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (transactionDataDefinitions.length > 0 && !isLoaded) {
            console.log("Loading...", transaction.institution_id);

            // set institution name
            const newName = institutionsMap.find((x) => {
                if (x.id === transaction.institution_id) {
                    return (x);
                }
            })
            setInstitutionName(newName.name);

            // build qualifier field list
            const f = []
            const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === transaction.institution_id);
            for (let i = 0; i < dataDefinition.length; i++) {
                f.push({value: i, label: dataDefinition[i].column_name});
            }
            setFieldOptions(f);

            // Format categories selector
            const options = [];
            categoriesMap.forEach((item) => {
                options.push({value: item.id, label: item.value});
            })
            setCategoryOptions(options);

            setIsLoaded(true);
        }
    }, [isLoaded]);

    // when we add a new qualifier, add it to the UI
    // useEffect(() => {
    // }, [qualifiers]);


    const eventHandler = (section) => {
        // funnel all changes through here

    }

    const onChangeHint = (event) => {
        setHintText(event.target.value);
    }

    const onChangeNotes = (event) => {
        setNotesText(event.target.value);
    }

    const onChangeQualifierPhrase = (event) => {
        setQualifierPhrase(event.target.value);
    }

    const updateCategory = (event) => {
        console.log("Update category: ", event);
        eventHandler({'category': event});
    }

    const changeIsCredit = () => {
        setIsCredit(!isCredit);
        eventHandler('isCredit')
    }

    const changeIsTaxDeductible = () => {
        setIsTaxDeductible(!isTaxDeductible);
        eventHandler('isTaxDeductible');
    }

    const addQualifier = () => {
        /*
            qualifiers - id, value, institution_id
            template_qualifiers - template_id, qualifier_id, data_column (string)
         */
        // check qualifier phrase and field
        if (qualifierPhrase.length === 0) {
            alert("Please specify a phrase to match against the transaction.");
            return;
        }

        // Ref IS valid here
        console.log("Current QRef: ", qualifierSelectionRef.current.getValue());
        if (!qualifierSelectionRef.current.getValue().length) {
            alert("Please select a Transaction Field to match against.")
            return;
        }
        const new_qid = createQualifier(qualifierPhrase, transaction.institution_id);
        console.log("New qualifier: ", new_qid);

        // Add new qualifier to our list of qualifiers for this template
        setQualifiers([...qualifiers, {
            id: new_qid,
            value: qualifierPhrase,
            institution_id: transaction.institution_id,
            data_column: qualifierSelectionRef.current.getValue()[0].label
        }]);

        // clear out UI
        qualifierSelectionRef.current.clearValue();
        setQualifierPhrase("");
    }

    const updateFieldSelection = (event) => {
        /*
            Selection of Transaction Field

            Ref isn't set yet so isn't valid here. We have to use the event
            console.log("QRef: ", qualifierSelectionRef.current.getValue());

            Use the data from the event to pull the data from the specified field and
             populate the Phrase entry (if it's not populated)
        */

        // get the data from the transaction that matches field event.label and ordinal event.value
        if(event) {
            // console.log("TData: ", transaction.transaction.transaction_data);
            const fieldData = transaction.transaction.transaction_data[event.value];
            setQualifierPhrase(fieldData);
            setQualifierField(event);
        }
    }

    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    const cancelEdit = () => {
        // If qualifiers have been created, warn that they won't be associated with a template
        if(qualifiers.length !== 0) {
            alert("There are unsaved qualifiers.  Do you want to cancel?");
        }
        closeHandler();
    }

    const submitEdit = () => {
        if(hintText.length === 0) {
            confirmAlert({
                title: "Error",
                message: "Please supply a descriptive hint for this template.",
                closeOnEscape: false,
                closeOnClickOutside: false,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => alert('Click Yes'),
                    }
                ]
            });
            return;
        }

        const payload = {
            "hint": hintText,
            "category": categorySelectionRef.current,
            "is_credit": isCredit,
            "is_tax_deductible": isTaxDeductible,
            "notes": notesText,
            "qualifiers":
                qualifiers.map((item) => {
                    return({"id": item.id, "field": item.data_column})
                })
            }

        console.log("Payload: ", payload);

        closeHandler(payload);
    }

    if (isLoaded) {
        return (<div>
                <Modal show={isOpen} onHide={cancelEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Template</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InstitutionName>{institutionName}</InstitutionName>
                        <label>Hint</label>
                        <input value={hintText} type="text" onChange={onChangeHint} autoFocus={true}/>
                        <label>Category</label>
                        <Select
                            id="templateCategorySelection"
                            ref={categorySelectionRef}
                            closeMenuOnSelect={true}
                            options={categoryOptions.sort(compareCategories)}
                            // menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            onChange={updateCategory}/>
                        <div id='radio_line'>
                            <Form.Check
                                className='matchAll'
                                type="switch"
                                id='checkIsCredit'
                                label="Is Credit"
                                checked={isCredit}
                                onChange={changeIsCredit}
                            />
                            <Form.Check
                                className='matchAll'
                                type="switch"
                                id='checkIsTaxDeductible'
                                label="Is Tax Deductible"
                                checked={isTaxDeductible}
                                onChange={changeIsTaxDeductible}
                            />
                        </div>
                        <label>Notes</label>
                        <input value={notesText} type="text" onChange={onChangeNotes}/>
                        <hr/>
                        <h5>Qualifiers</h5>
                        <p id='qualifier_instructions'>The software will attempt to match the following phase(s) against
                            the field(s) specified when trying to assign a Category to the transaction.</p>
                        <ExistingQualifierList>
                            <thead>
                            <tr>
                                <th>Phrase</th>
                                <th>Data Field</th>
                            </tr>
                            </thead>
                            <tbody>
                            {qualifiers.map((item) => {
                                return(<tr><td>{item.value}</td><td>{item.data_column}</td></tr>);
                            })}
                            </tbody>
                        </ExistingQualifierList>
                        <label>Phrase</label>
                        <input value={qualifierPhrase} type="text" onChange={onChangeQualifierPhrase}/>
                        <label>Field</label>
                        <Select
                            id="qualifierFieldSelection"
                            closeMenuOnSelect={true}
                            ref={qualifierSelectionRef}
                            options={fieldOptions}
                            // menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            onChange={updateFieldSelection}
                        />
                        <Button variant="primary" onClick={addQualifier}>Add</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={cancelEdit}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={submitEdit}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>);
    }
}

export default CreateTemplateDialogComponent;