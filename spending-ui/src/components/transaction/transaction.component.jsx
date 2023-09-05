

const Transaction = ({transaction}) => {
    // console.log("Trans: ", transaction);
    try {
        const {id, transaction_date, institution, transaction_data} = transaction;
        return(
            <div>
                <span>{id}</span>
                <span>{transaction_date}</span>
                <span>{institution.key}</span>
                <div>{transaction_data}</div>
            </div>
        )
    } catch (error) {
        console.log("Error: ", error);
    }
}

export default Transaction;
