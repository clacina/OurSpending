import React, {useContext, useEffect, useRef, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import * as FaIcons from "react-icons/hi";
import * as AiIcons from "react-icons/ai";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { Tooltip } from 'react-tooltip';

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
    const [category, setCategory] = useState();
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
                const id = item.id;
                var label = item.value;
                if(item.is_tax_deductible) {
                    label = (
                        <>
                            <span style={{color: "green", paddingRight: "5px"}}>{item.value}</span>
                            <HiOutlineReceiptTax data-tooltip-id="test_tip" style={{color: "green", paddingBottom: "2px"}}/>
                            <Tooltip id="test_tip">
                                <div>
                                    <h3>This is a very interesting header</h3>
                                    <p>Here's some interesting stuff:</p>
                                    <ul>
                                        <li>Some</li>
                                        <li>Interesting</li>
                                        <li>Stuff</li>
                                    </ul>
                                </div>
                            </Tooltip>
                        </>
                    )
                }
                options.push({value: id, label: label, label_text: item.value});
            })
            setCategoryOptions(options);

            setIsLoaded(true);
        }
    }, [isLoaded]);

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
        setCategory(event.value);
    }

    const changeIsCredit = () => {
        setIsCredit(!isCredit);
    }

    const changeIsTaxDeductible = () => {
        setIsTaxDeductible(!isTaxDeductible);
    }

    const checkMatches = async () => {

    }

    const addQualifier = async () => {
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
        // const new_qid = await createQualifier(qualifierPhrase, transaction.institution_id);
        // console.log("New qualifier: ", new_qid);

        // Add new qualifier to our list of qualifiers for this template
        setQualifiers([...qualifiers, {
            id: null,
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
        return ('' + a.label_text.toLowerCase()).localeCompare(b.label_text.toLowerCase());
    }

    const cancelEdit = () => {
        // If qualifiers have been created, warn that they won't be associated with a template
        if(qualifiers.length !== 0) {
            confirmAlert({
                title: "Warning",
                message: "There are unsaved Qualifiers.  Are you sure you wish to exit?",
                closeOnEscape: true,
                closeOnClickOutside: true,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => closeHandler(),
                    },
                    {
                        label: 'No',
                        onClick: () => {
                            setIsOpen(true);
                        }
                    }
                ]
            });
        } else {
            setIsOpen(false);
            closeHandler();
        }
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
            "category_id": category,
            "is_credit": isCredit,
            "notes": notesText,
            "institution_id": transaction.institution_id,
            "qualifiers":
                qualifiers.map((item) => {
                    return({"id": item.id, "data_column": item.data_column})
                }),
            "tags": []
            }

        console.log("Payload: ", payload);

        closeHandler(payload);
    }

    if (isLoaded) {
        return (
                <Modal
                    show={isOpen}
                    scrollable={true}
                    onHide={cancelEdit}
                    size="xl"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create Template</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InstitutionName>{institutionName}</InstitutionName>
                        <div id='template_edit_container' className='row'>
                            <div id='template_data_div' className='col-md-4'>
                                <label>Hint</label>
                                <input value={hintText} type="text" onChange={onChangeHint} autoFocus={true}/>
                                <label>Category</label>
                                <div id="radio_line">
                                    <Select
                                        id="templateCategorySelection"
                                        ref={categorySelectionRef}
                                        closeMenuOnSelect={true}
                                        options={categoryOptions.sort(compareCategories)}
                                        menuPosition={'fixed'}
                                        onChange={updateCategory}/>
                                    <Form.Check
                                        className='matchAll'
                                        type="switch"
                                        id='checkIsCredit'
                                        label="Is Credit"
                                        checked={isCredit}
                                        onChange={changeIsCredit}
                                    />
                                </div>
                                <label style={{'margin-top': '20px'}}>Notes</label>
                                <input value={notesText} type="text" onChange={onChangeNotes}/>
                            </div>
                            <div id='template_qualifiers_div' className='col-md-6'>
                                <h5>Qualifiers</h5>
                                <p id='qualifier_instructions'>The software will attempt to match the following phase(s)
                                    against
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
                                        return (<tr>
                                            <td>{item.value}</td>
                                            <td>{item.data_column}</td>
                                        </tr>);
                                    })}
                                    </tbody>
                                </ExistingQualifierList>
                                <div>
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
                                </div>
                                <div id="qualifierPhraseDiv">
                                    <label>Phrase</label>
                                    <input value={qualifierPhrase} type="text" onChange={onChangeQualifierPhrase}/>
                                </div>
                                <Button variant="outline-primary" onClick={addQualifier}>Add Qualifier</Button>
                                <Button variant="outline-primary" style={{float: 'right'}} onClick={checkMatches}>Check Matches</Button>
                            </div>
                            <hr/>
                            <div id='template_match_div' className='col-d-2'>
                                <p>This is my results</p>

                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    <Button variant="primary" onClick={submitEdit}>Save Template</Button>
                    </Modal.Footer>
                </Modal>
        );
    }
}

export default CreateTemplateDialogComponent;