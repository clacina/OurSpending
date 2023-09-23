import Transaction from "./transaction.component.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {useContext, useEffect, useState} from "react";

const TransactionList = ({institution_id, transactions}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions, institutions} = useContext(StaticDataContext);

    useEffect(() => {
        if(transactionDataDefinitions.length !== 0 && institutions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, institutions.length]);

    if(isLoaded) {
        const ourInstitution = institutions.filter((i) => {
            return (i.id === institution_id)
        })

        const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === institution_id);
        const dataNames = dataDefinition.map((column) => column.column_name);

        return (
            <div>
                <h1>{ourInstitution[0].name}</h1>
                <div>
                    <table border="1">
                        <thead>
                            <tr>
                                {dataNames.map((col) => <th>{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(item => <Transaction key={item.id} transaction={item} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default TransactionList;
