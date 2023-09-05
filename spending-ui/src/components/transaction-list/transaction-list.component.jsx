import Transaction from "../transaction/transaction.component";
import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext} from "react";

const TransactionList = ({transactions}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    console.log(transactionDataDefinitions);

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
