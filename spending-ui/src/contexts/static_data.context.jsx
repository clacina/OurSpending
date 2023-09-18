import {createContext, useEffect, useState} from "react";
import {transaction_data_descriptions} from "../assets/data/data_descriptions.jsx";
// import {institutionData} from "../assets/data/banks.jsx";
const request = require('request');

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
        request('http://localhost:8000/resources/banks', (error, response, body) => {
            console.log("Got banks: ", body);
            setInstitutions(body);
        });
        setTransactionDataDefinitions(transaction_data_descriptions);
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
