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
        if (!trans_groups.hasOwnProperty(t.institution.id)) {
            trans_groups[t.institution.id] = [];
        }
        trans_groups[t.institution.id].push(t);
    })
    // console.log('Groupings: ', trans_groups);
    const grouping_array = Object.values(trans_groups);
    return(
        <div>
            <h1>Transactions</h1>
            {grouping_array.map((item) => {
                // console.log('Item: ', item);
                return(<TransactionList key={item[0].institution.id} transactions={item} institution_id={item[0].institution.id}/>);
            })}
        </div>
    )
}

export default TransactionsList;
