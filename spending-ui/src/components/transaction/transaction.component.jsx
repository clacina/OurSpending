import TransactionRow from "./transaction-row.component.jsx";

const Transaction = ({transaction}) => {
    return(
        <TransactionRow transaction={transaction} />
    )
}

export default Transaction;
