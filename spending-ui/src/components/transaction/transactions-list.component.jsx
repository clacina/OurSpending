/*************************************************************************************
 Transactions UI Page

 TransactionsList       grouping of transactions by institution                     transactions-list.component.jsx
    TransactionList     list of transactions for a given institution                transaction-list.component.jsx

       Transaction     container for TransactionRow below - possibly redundant?     transaction.component.jsx
          TransactionRow - row in TransactionList                                   transaction-row.component.jsx

 TransactionEntry - single entity edit form - NO LONGER USED                  transaction-entry.component.jsx
 *************************************************************************************/
import TransactionList from "./transaction-list.component.jsx";
import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";

const TransactionsList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [groupingArray, setGroupingArray] = useState([]);
    const [transactionsMap, setTransactionsMap] = useState([]);
    const routeParams = useParams();

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/transactions/' + routeParams.batch_id;
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        console.log("Loaded: " + str.length + " transactions");
        return(str);
    };

    useEffect(() => {
        console.log("Starting API Call...")
        console.time("Load Time");
        getTransactions().then((res) => setTransactionsMap(res));

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
            <div>
                {groupingArray.map((item) => {
                    return (<TransactionList key={item[0].institution.id} transactions={item}
                                             institution_id={item[0].institution.id}/>);
                })}
            </div>
        )
    }
}

export default TransactionsList;
