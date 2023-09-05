import {createContext, useEffect, useState} from "react";
import {transaction_data_descriptions} from "../data";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    setTransactionDataDefinitions: () => null,
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);

    useEffect(() => {
        setTransactionDataDefinitions(transaction_data_descriptions);
        // because we're calling an async function, we need an async handler
        // const getCategoriesMap = async () => {
        //     const categoryMap = await getCategoriesAndDocuments();
        //     setCategoriesMap(categoryMap);
        // }
        // getCategoriesMap();
    }, []);

    const value = {transactionDataDefinitions, setTransactionDataDefinitions};
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
