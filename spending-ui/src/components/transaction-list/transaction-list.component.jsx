import Transaction from "../transaction/transaction.component";

const TransactionList = (transactions) => {
    return (
        <div>
            <h1>Transactions</h1>
            <div>
                {transactions.map(item => <Transaction key={item.id} transaction={item} />)}
            </div>
        </div>
    )
}

export default TransactionList;
