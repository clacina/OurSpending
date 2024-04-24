import React, {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import BootstrapTable from "react-bootstrap-table-next";
import {nanoid} from "nanoid";
import './credit.card.component.styles.css';
import {HeaderButton} from "../widgets/button/button.styles";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {confirmAlert} from "react-confirm-alert";
import {InstitutionsContext} from "../../contexts/banks.context";
import CurrencyInput from "react-currency-input-field";

/*
    Data to gather:
        Per Bank:
        - New Balance
        - minimum payment

    Display:
        Per Bank:
            - Current Balance
            - Last Updated
            - Last Minimum




 */
const CreditCardDataUpdateForm = ({closeHandler}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const {institutionsMap, updateInstitution, setUpdate} = useContext(InstitutionsContext);
    const [newBalance, setNewBalance] = useState("");
    const [newMinimum, setNewMinimum] = useState("");
    const {creditCardInfo, creditCardData} = useContext(StaticDataContext);
    const [variablesBalance, setVariablesBalance] = useState({});
    const [variablesMinPayment, setVariablesMinPayment] = useState({});

    function compareValues(a, b) {
        // console.log(a + ":" + b)
        return (a.name < b.name);
    }

    useEffect(() => {
        let variable_dict_balance = {}
        let variable_dict_min_payment = {}
        creditCardInfo.forEach((item) => {
            variable_dict_balance["entry_balance_" + item.id] = '';
            variable_dict_min_payment["entry_min_payment_" + item.id] = '';
        })
        setVariablesBalance(variable_dict_balance)
        setVariablesMinPayment(variable_dict_min_payment)

        setIsLoaded(true);
    }, [isLoaded, ]);

    const cancelEdit = () => {
        closeHandler(null, null, false);
    }

    const submitEdit = () => {
        // setUncategorizedMap(Object.entries(categoryGroups).filter((item) => {

        Object.entries(variablesBalance).forEach((item) => {
            console.log(item);
        })
        Object.entries(variablesMinPayment).forEach((item) => {
            console.log(item);
        })

        // if(hintText.length === 0) {
        //     confirmAlert({
        //         title: "Error",
        //         message: "Please supply a descriptive hint for this template.",
        //         closeOnEscape: false,
        //         closeOnClickOutside: false,
        //         buttons: [
        //             {
        //                 label: 'Ok',
        //                 onClick: () => alert('Click Yes'),
        //             }
        //         ]
        //     });
        //     return;
        // }

        const payload = {
            // "hint": hintText,
            // "category_id": category,
            // "is_credit": isCredit,
            // "notes": notesText,
            // "institution_id": transaction.institution_id,
            // "qualifiers":
            //     qualifiers.map((item) => {
            //         return({"id": item.id, "value": item.value, "data_column": item.data_column})
            //     }),
            // "tags": []
        }

        // console.log("Payload: ", payload);

        closeHandler(payload);
    }

    const onChangeBalance = (value, name, values) => {
        console.log("Change balance: ",value);
        console.log("Change balance: ", values);
        console.log("name: ", name);
        let current_variables = variablesBalance;
        current_variables[name] = value;
        setVariablesBalance(current_variables)
    }

    const onChangeMinimum = (value, name, values) => {
        console.log("Change minimum: ", value);
        let current_variables = variablesMinPayment;
        current_variables[name] = value;
        setVariablesMinPayment(current_variables)
    }

    if(isLoaded) {
        return (
            <Modal
                show={isOpen}
                scrollable={true}
                onHide={cancelEdit}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Update Balances</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        creditCardInfo.sort(compareValues).map((item) => {
                            console.log(item);
                            return(
                                <div className='cardEntryLine'>
                                    <h2>{item.name}</h2>
                                    <div className='cardCurrentInfo'>
                                        <div className='cardInfo'>
                                            <div className='cardInfoLabel'>Current Balance:</div><div className='cardInfoData'>{'$'+Intl.NumberFormat().format(item.balance)}</div>
                                            <div className='cardInfoLabel'>Last Updated:</div><div className='cardInfoData'>{item.balance_date}</div>
                                            <div className='cardInfoLabel'>Last Minimum:</div><div className='cardInfoData'>{'$'+Intl.NumberFormat().format(item.minimum_payment)}</div>
                                        </div>
                                    </div>
                                    <div id="entry_line">
                                        <div className="update_form_entry">
                                            <label>New Balance</label>
                                            <CurrencyInput
                                                value={variablesBalance[item.id]}
                                                id={"entry_balance_" + item.id}
                                                name={"entry_balance_" + item.id}
                                                decimalsLimit={2}
                                                onValueChange={onChangeBalance}/>
                                        </div>
                                        <div className="update_form_entry">
                                            <label>New Minimum Payment</label>
                                            <CurrencyInput
                                                id={"entry_min_payment_" + item.id}
                                                name={"entry_min_payment_" + item.id}
                                                decimalsLimit={2}
                                                value={variablesMinPayment[item.id]}
                                                onValueChange={onChangeMinimum}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    <Button variant="primary" onClick={submitEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreditCardDataUpdateForm;
