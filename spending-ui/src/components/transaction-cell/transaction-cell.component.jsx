const TransactionCell = ({transaction}) => {
    const {transaction_data} = transaction;
    return(
        <tr>
            {Object.values(transaction_data).map((item) => {
                return(<td>{item}</td>);
            })}
        </tr>
    )
}

export default TransactionCell;
