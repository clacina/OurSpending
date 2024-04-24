import React, {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import './credit.card.component.styles.css';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
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
    const {creditCardInfo} = useContext(StaticDataContext);
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
    }, [isLoaded,]);

    const cancelEdit = () => {
        closeHandler(null, false);
    }

    const submitEdit = () => {
        // Object.entries(variablesBalance).forEach((item) => {
        //     console.log(item);
        // })
        // Object.entries(variablesMinPayment).forEach((item) => {
        //     console.log(item);
        // })

        const payload = {
            "updatedBalance": variablesBalance, "updatedMinPayment": variablesMinPayment
        }

        closeHandler(payload, true);
    }

    const onChangeBalance = (value, name, values) => {
        let current_variables = variablesBalance;
        current_variables[name] = value;
        setVariablesBalance(current_variables)
    }

    const onChangeMinimum = (value, name, values) => {
        let current_variables = variablesMinPayment;
        current_variables[name] = value;
        setVariablesMinPayment(current_variables)
    }

    if (isLoaded) {
        return (<Modal
                show={isOpen}
                scrollable={true}
                onHide={cancelEdit}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Update Balances</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {creditCardInfo.sort(compareValues).map((item) => {
                        console.log(item);
                        return (<div className='cardEntryLine'>
                                <h2>{item.name}</h2>
                                <div className='cardCurrentInfo'>
                                    <div className='cardInfo'>
                                        <div className='cardInfoLabel'>Current Balance:</div>
                                        <div
                                            className='cardInfoData'>{'$' + Intl.NumberFormat().format(item.balance)}</div>
                                        <div className='cardInfoLabel'>Last Updated:</div>
                                        <div className='cardInfoData'>{item.balance_date}</div>
                                        <div className='cardInfoLabel'>Last Minimum:</div>
                                        <div
                                            className='cardInfoData'>{'$' + Intl.NumberFormat().format(item.minimum_payment)}</div>
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
                            </div>);
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    <Button variant="primary" onClick={submitEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>);
    }
}

export default CreditCardDataUpdateForm;
