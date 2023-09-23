import {createContext, useEffect, useState} from "react";

export const TransactionsContext = createContext({
    transactions: [],
    setTransactions: () => null,
});

export const TransactionsProvider = ({batch_id}) => {
    const [transactionsMap, setTransactionsMap] = useState([]);

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/transactions/' + batch_id;
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        getTransactions().then((res) => setTransactionsMap(res));
    }, []);

    // const value = {transactionsMap, setTransactionsMap};
    // return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
};
