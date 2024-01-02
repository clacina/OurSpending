import {createContext, useContext, useEffect, useState} from "react";
import send from "../utils/http_client";
import {TagsContext} from "./tags.context";

export const ProcessedTransactionsContext = createContext({
    processedTransactions: [],
    setProcessedTransactions: () => null,
});

export const ProcessedTransactionsProvider = ({children}) => {
    const [processedTransactionsMap, setProcessedTransactionsMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getTransactions = async (batch_id) => {
        const url = 'http://localhost:8000/resources/processed_transactions/' + batch_id
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            console.log("TransactionsContext - loading Transactions");
            getTransactions().then((res) => setProcessedTransactionsMap(res));
            setUpdate(false);
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    const value = {getTransactions};
    return <ProcessedTransactionsContext.Provider value={value}>{children}</ProcessedTransactionsContext.Provider>
};
