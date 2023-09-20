import {createContext, useEffect, useState} from "react";
// import {transaction_data_descriptions} from "../assets/data/data_descriptions.jsx";

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
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getTransactionDefinitions = async () => {
        const url = 'http://localhost:8000/resources/data_definitions'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getBanks().then((res) => setInstitutions(res));
            getTransactionDefinitions().then((res) => setTransactionDataDefinitions(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const value = {transactionDataDefinitions, setTransactionDataDefinitions, institutions, setInstitutions};
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
