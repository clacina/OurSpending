/*************************************************************************************
 Transactions UI
 TransactionsList - grouping of transactions by institution
 TransactionList - list of transactions for a given institution
 Transaction - container for TransactionCell
 TransactionCell - row in TransactionList
 *************************************************************************************/
import TransactionList from "../transaction-list/transaction-list.component";

const TransactionsList = ({transactions}) => {
    // Group transactions by institution id
    const trans_groups = {}

    transactions.forEach((t) => {
        if (!trans_groups.hasOwnProperty(t.institution_id)) {
            trans_groups[t.institution_id] = [];
        }
        trans_groups[t.institution_id].push(t);
    })

    const grouping_array = Object.values(trans_groups);
    return (
        <div>
            <h1>Transactions</h1>
            {grouping_array.map((item) => {
                return (<TransactionList key={item[0].institution_id} transactions={item}
                                         institution_id={item[0].institution_id}/>);
            })}
        </div>
    )
}

export default TransactionsList;
