import React, {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import BootstrapTable from "react-bootstrap-table-next";
import {nanoid} from "nanoid";
import './credit.card.component.styles.css';
import {HeaderButton} from "../widgets/button/button.styles";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";
import CreditCardDataUpdateForm from "./credit.card.data.update.form";

const CreditCards = () => {
    const {setSectionTitle, creditCardInfo, creditCardData, loanInfo, servicesInfo} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [columns, setColumns] = useState([]);
    const [loanColumns, setLoanColumns] = useState([]);
    const [servicesColumns, setServicesColumns] = useState([]);
    const [creditCardRecords, setCreditCardRecords] = useState([]);
    const [loanRecords, setLoanRecords] = useState([]);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [firstHalfPayment, setFirstHalfPayment] = useState(0.0);
    const [secondHalfPayment, setSecondHalfPayment] = useState(0.0);
    const [totalBalance, setTotalBalance] = useState(0.0);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);

    useEffect(() => {
        console.log("Start");
        setSectionTitle('Debit');
        if(creditCardInfo.length > 0 && creditCardData.length > 0) {
            setCreditCardRecords(buildCreditRecords());
            setLoanRecords(loanInfo);
            setServiceRecords(servicesInfo);

            generateCreditCardColumns();
            generateLoanColumns();
            generateServiceColumns();
            setIsLoaded(true);
        }

    }, [creditCardInfo, creditCardData]);

    function compareValues(a, b) {
        return (a.balance_date < b.balance_date);
    }

    const buildCreditRecords = () => {
        let cardDetails = []
        creditCardInfo.forEach((item) => {
            // Get latest balance record
            const card_data = creditCardData.filter((info) => {
                return(info.card_id === item.id);
            });
            const recentRecord = card_data.sort(compareValues)[0]
            item.balance = recentRecord.balance;
            item.minimum_payment = recentRecord.minimum_payment;
            item.balance_date = recentRecord.balance_date;
            cardDetails.push(item);
        });

        let fh = 0.0;
        let sh = 0.0;
        let tb = 0.0;
        cardDetails.forEach((item) => {
            if (item.due_date < 15) {
                fh = fh + item.minimum_payment;
            } else {
                sh = sh + item.minimum_payment;
            }
            tb = tb + item.balance;
        })

        // Loan Data
        loanInfo.forEach((item) => {
            console.log(item);
            if(item.due_date < 15) {
                fh = fh + item.payment;
            } else {
                sh = sh + item.payment;
            }
        })

        setFirstHalfPayment('$'+Intl.NumberFormat().format(fh));
        setSecondHalfPayment('$'+Intl.NumberFormat().format(sh));
        setTotalBalance('$'+Intl.NumberFormat().format(tb));

        return(cardDetails);
    }

    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return ('$' + Intl.NumberFormat().format(cell));
    }

    const percentColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2) + '%');
    }

    const generateCreditCardColumns = () => {
        //-------------- Configure our table -----------------------------
        const headerBackgroundColor = '#008080'
        const cols = [];

        cols.push({
            dataField: 'name',
            text: 'Bank',
            align: 'left',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            }
        });

        cols.push({
            dataField: 'balance',
            text: 'Balance (We Owe)',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '160px',
            }
        });

        cols.push({
            dataField: 'credit_limit',
            text: 'Credit Limit',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'balance_date',
            text: 'Balance Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'interest_rate',
            text: 'Rate',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white',
            },
            formatter: percentColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'interest_rate_cash',
            text: 'Cash Rate',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: percentColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'due_date',
            text: 'Due Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'minimum_payment',
            text: 'Minimum Payment',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({dataField: 'id', text: nanoid(), hidden: true})
        setColumns(cols);
    }

    /*
        create table loans
        (
            id          serial,
            name        text not null,
            term        numeric,
            term_length integer,
            term_rate   numeric,
            balance     numeric,
            payment     numeric,
            due_date    integer,
            loan_type   text,
            notes       text
        );
     */

    const generateLoanColumns = () => {
        //-------------- Configure our table -----------------------------
        const headerBackgroundColor = '#008080'

        const cols = [];

        cols.push({
            dataField: 'name',
            text: 'Name',
            align: 'left',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            }
        });

        cols.push({
            dataField: 'balance',
            text: 'Balance (We Owe)',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '160px',
            }
        });

        cols.push({
            dataField: 'term',
            text: 'Amount',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'balance_date',
            text: 'Balance Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'term_rate',
            text: 'Rate',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white',
            },
            formatter: percentColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'due_date',
            text: 'Due Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'payment',
            text: 'Payment',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({dataField: 'id', text: nanoid(), hidden: true})
        setLoanColumns(cols);
    }

    const generateServiceColumns = () => {
        //-------------- Configure our table -----------------------------
        const headerBackgroundColor = '#008080'

        const cols = [];

        cols.push({
            dataField: 'name',
            text: 'Name',
            align: 'left',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            }
        });

        cols.push({
            dataField: 'amount',
            text: 'Amount',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'balance_date',
            text: 'Balance Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '140px',
            }
        });

        cols.push({
            dataField: 'due_date',
            text: 'Due Date',
            align: 'right',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({
            dataField: 'term_length',
            text: 'Term',
            sort: true,
            editable: false,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            }
        });

        cols.push({dataField: 'id', text: nanoid(), hidden: true})
        setServicesColumns(cols);
    }


    //-------------------- Event Handlers ---------------------------------
    const openModal = () => {
        setOpenUpdateForm(true);
    }

    const closeModal = async (id, value, save_result) => {
        if (openUpdateForm) {
            console.log("Close Modal: ", value);
            setOpenUpdateForm(false);
            if(save_result) {
                // console.log("---Saving: ", editColumn);
                // switch(editColumn) {
                //     case 4: // notes
                //         await updateNotes(id, value);
                //         break;
                //     default: break;
                // }
            }
        }
    }

    //-------------------- Event Handlers ---------------------------------

    if(isLoaded) {
        return (
            <div id='creditCardUIContainer'>
                <span><HeaderButton onClick={openModal}>Update</HeaderButton></span>
                <BootstrapTable
                    keyField='id'
                    data={creditCardRecords}
                    columns={columns}
                />
                <BootstrapTable
                    keyField='id'
                    data={loanRecords}
                    columns={loanColumns}
                />
                <BootstrapTable
                    keyField='id'
                    data={serviceRecords}
                    columns={servicesColumns}
                />
                <div id='creditCardSummaryContainer'>
                    <p>Minimum Payment First of the Month: {firstHalfPayment}</p>
                    <p>Minimum Payment Second Paycheck: {secondHalfPayment}</p>
                    <p>Total Credit Card Debit: {totalBalance}</p>
                </div>
                {
                    openUpdateForm && <CreditCardDataUpdateForm
                        closeHandler={closeModal}
                    />
                }
            </div>
        );
    }
}

export default CreditCards;