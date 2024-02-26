import React, {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import BootstrapTable from "react-bootstrap-table-next";
import TagSelectorCategoryComponent from "../widgets/tag-selector/tag-selector-category.component";
import {nanoid} from "nanoid";

const CreditCards = () => {
    const {setSectionTitle, creditCardInfo, creditCardData} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [columns, setColumns] = useState([]);
    const [creditCardRecords, setCreditCardRecords] = useState([]);

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
            console.log("ccd: ", creditCardData);
            // Get latest balance record
            const card_data = creditCardData.filter((info) => {
                return(info.card_id === item.id);
            });
            console.log("Card Data: ", card_data);
            const recentRecord = card_data.sort(compareValues)[0]
            console.log("recent: ", recentRecord);
            item.balance = recentRecord.balance;
            item.minimum_payment = recentRecord.minimum_payment;
            item.balance_date = recentRecord.balance_date;
            cardDetails.push(item);
        });
        console.log("Result Set: ", cardDetails);
        return(cardDetails);
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
            text: 'Balance',
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
                width: '100px',
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
                color: 'white'
            },
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
            headerAttrs: {
                width: '100px',
            }
        });

        cols.push({dataField: 'id', text: nanoid(), hidden: true})
        setColumns(cols);
    }

    //-------------------- Event Handlers ---------------------------------
    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2));
    }


    if(isLoaded) {
        console.log("Columns: ", columns);
        console.log("Data: ", creditCardInfo);
        return (
            <div>
                <table>
                    <BootstrapTable
                        keyField='id'
                        data={creditCardRecords}
                        columns={columns}
                    />
                </table>
            </div>
        );
    }
}

export default CreditCards;