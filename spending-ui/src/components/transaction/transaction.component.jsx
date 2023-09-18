import TransactionRow from "../transaction-row/transaction-row.component";

const Transaction = ({transaction}) => {
    return(
        <TransactionRow transaction={transaction} />
    )
}

export default Transaction;
