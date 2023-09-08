import {createContext, useEffect, useState} from "react";
import {transaction_data_descriptions, institutionData} from "../data";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    setTransactionDataDefinitions: () => null,
    institutions: [],
    setInstitutions: () => null,
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);
    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        setTransactionDataDefinitions(transaction_data_descriptions);
        setInstitutions(institutionData);
        // because we're calling an async function, we need an async handler
        // const getCategoriesMap = async () => {
        //     const categoryMap = await getCategoriesAndDocuments();
        //     setCategoriesMap(categoryMap);
        // }
        // getCategoriesMap();
    }, []);

    const value = {transactionDataDefinitions, setTransactionDataDefinitions, institutions, setInstitutions};
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
