/*************************************************************************************
 Transactions UI
 TransactionsList - grouping of transactions by institution
 TransactionList - list of transactions for a given institution
 Transaction - container for TransactionRow below - possibly redundant?
 TransactionRow - row in TransactionList
 TransactionEntry - single transaction edit form
 *************************************************************************************/
import TransactionList from "../transaction-list/transaction-list.component";
import {useContext, useEffect, useState} from "react";
import {TransactionsContext} from "../../contexts/transactions.context.jsx";

const TransactionsList = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionsMap} = useContext(TransactionsContext);
    const [groupingArray, setGroupingArray] = useState([]);

    useEffect(() => {
        console.log("Start");
        if (transactionsMap.length !== 0) {
            // Group transactions by institution id
            const trans_groups = {}
            transactionsMap.forEach((t) => {
                if (!trans_groups.hasOwnProperty(t.institution_id)) {
                    trans_groups[t.institution_id] = [];
                }
                trans_groups[t.institution_id].push(t);
            })

            setGroupingArray(Object.values(trans_groups));
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionsMap]);

    if (isLoaded) {
        return (
            <div>
                <h1>Transactions</h1>
                {groupingArray.map((item) => {
                    return (<TransactionList key={item[0].institution_id} transactions={item}
                                             institution_id={item[0].institution_id}/>);
                })}
            </div>
        )
    }
}

export default TransactionsList;
