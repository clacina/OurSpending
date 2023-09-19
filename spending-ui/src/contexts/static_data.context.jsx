import {createContext, useEffect, useState} from "react";
import {transaction_data_descriptions} from "../assets/data/data_descriptions.jsx";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    setTransactionDataDefinitions: () => null,
    institutions: [],
    setInstitutions: () => null,
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);
    const [institutions, setInstitutions] = useState([]);

    const getBanks = async () => {
        const url = 'http://localhost:8000/resources/banks'
        // console.log("Calling fetch: ");
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            // console.log("Requesting bank data...");
            getBanks().then((res) => {
                // console.log("Data: ", res);
                setInstitutions(res);
            });
        } catch (e) {
            console.log("Error getting bank data: ", e);
        }
        setTransactionDataDefinitions(transaction_data_descriptions);
    }, []);

    const value = {transactionDataDefinitions, setTransactionDataDefinitions, institutions, setInstitutions};
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
