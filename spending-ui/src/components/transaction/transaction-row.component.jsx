const TransactionRow = ({transaction}) => {
    const {transaction_data} = transaction;
    const editHandler = (event) => {
        console.log("Click ", event.target.id);

        // Navigate to new screen - with entity

    }

    return(
        <tr>
            {Object.values(transaction_data).map((item) => {
                return(<td>{item}</td>);
            })}
            <td><button id={transaction.id} onClick={editHandler}>Edit</button></td>
        </tr>
    )
}

export default TransactionRow;
