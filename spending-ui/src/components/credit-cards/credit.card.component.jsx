import React, {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import BootstrapTable from "react-bootstrap-table-next";
import {nanoid} from "nanoid";
import './credit.card.component.styles.css';


const CreditCards = () => {
    const {setSectionTitle, creditCardInfo, creditCardData} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [columns, setColumns] = useState([]);
    const [creditCardRecords, setCreditCardRecords] = useState([]);
    const [firstHalfPayment, setFirstHalfPayment] = useState(0.0);
    const [secondHalfPayment, setSecondHalfPayment] = useState(0.0);
    const [totalBalance, setTotalBalance] = useState(0.0);

    useEffect(() => {
        console.log("Start");
        setSectionTitle('Credit Cards');
        if(creditCardInfo.length > 0 && creditCardData.length > 0) {
            setCreditCardRecords(buildCreditRecords());
            generateColumns();
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
        setFirstHalfPayment('$'+Intl.NumberFormat().format(fh));
        setSecondHalfPayment('$'+Intl.NumberFormat().format(sh));
        setTotalBalance('$'+Intl.NumberFormat().format(tb));

        return(cardDetails);
    }

    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return('$'+Intl.NumberFormat().format(cell));
    }

    const percentColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2) + '%');
    }

    const generateColumns = () => {
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

    //-------------------- Event Handlers ---------------------------------

    if(isLoaded) {
        return (
            <div id='creditCardUIContainer'>
                <BootstrapTable
                    keyField='id'
                    data={creditCardRecords}
                    columns={columns}
                />
                <div id='creditCardSummaryContainer'>
                    <p>Minimum Payment First of the Month: {firstHalfPayment}</p>
                    <p>Minimum Payment Second Paycheck: {secondHalfPayment}</p>
                    <p>Total Owed Balance: {totalBalance}</p>
                </div>
            </div>
        );
    }
}

export default CreditCards;