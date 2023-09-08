import TransactionCell from "../transaction-cell/transaction-cell.component";

const Transaction = ({transaction}) => {
    return(
        <TransactionCell transaction={transaction} />
    )
}

export default Transaction;
