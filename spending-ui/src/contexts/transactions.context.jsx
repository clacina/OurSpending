import {createContext, useEffect, useState} from "react";

export const TransactionsContext = createContext({
    transactions: [],
    setTransactions: () => null,
});

export const TransactionsProvider = ({children}) => {
    const [transactionsMap, setTransactionsMap] = useState([]);

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/transactions/1'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        getTransactions().then((res) => setTransactionsMap(res));
        // because we're calling an async function, we need an async handler
        // const getCategoriesMap = async () => {
        //     const categoryMap = await getCategoriesAndDocuments();
        //     setCategoriesMap(categoryMap);
        // }
        // getCategoriesMap();
    }, []);

    const value = {transactionsMap, setTransactionsMap};
    return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
};
