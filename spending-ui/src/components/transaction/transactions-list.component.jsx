/*************************************************************************************
 Transactions UI Page

 TransactionsList       grouping of transactions by institution                     transactions-list.component.jsx
    TransactionList     list of transactions for a given institution                transaction-list.component.jsx

 TransactionEntry - single entity edit form - NO LONGER USED                  transaction-entry.component.jsx
 *************************************************************************************/
import TransactionList from "./transaction-list.component.jsx";
import React, {useContext, useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import './transactions-list.component.styles.css';
import {StaticDataContext} from "../../contexts/static_data.context";
import {TransactionsContext} from "../../contexts/transactions.context";


const TransactionsList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [groupingArray, setGroupingArray] = useState([]);
    const [transactionsMap, setTransactionsMap] = useState([]);
    const routeParams = useParams();
    const {setSectionTitle} = useContext(StaticDataContext);
    const {getTransactions} = useContext(TransactionsContext);

    useEffect(() => {
        console.log("Starting API Call...")
        console.time("Load Time");
        getTransactions(routeParams.batch_id).then((res) => setTransactionsMap(res));
        setSectionTitle("Transactions");
        if (transactionsMap.length !== 0) {
            // Group transactions by institution id
            const trans_groups = {}
            transactionsMap.forEach((t) => {
                if (!trans_groups.hasOwnProperty(t.institution.id)) {
                    trans_groups[t.institution.id] = [];
                }
                trans_groups[t.institution.id].push(t);
            })

            setGroupingArray(Object.values(trans_groups));
            setIsLoaded(true);
            console.timeEnd("Load Time")
        } else {
            console.info("No definitions yet");
        }
    }, [transactionsMap.length]);

    if (isLoaded) {
        return (
            <div id='transactions_list_container'>
                {groupingArray.map((item) => {
                    return (<TransactionList
                                transactions={item}
                                institution_id={item[0].institution.id}
                                batch_id={routeParams.batch_id}
                    />);
                })}
            </div>
        )
    }
}

export default TransactionsList;
