import {createContext, useEffect, useState} from "react";

export const ProcessedTransactionsContext = createContext({
    processedTransactions: [],
    setProcessedTransactions: () => null,
});

export const ProcessedTransactionsProvider = ({children}) => {
    const [processedTransactionsMap, setProcessedTransactionsMap] = useState([]);
    const [update, setUpdate] = useState(true);
    const [currentBatchId, setCurrentBatchId] = useState(null);

    const getTransactions = async (batch_id) => {
        setCurrentBatchId(batch_id);
        const url = 'http://localhost:8000/resources/processed_transactions/' + batch_id
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            if(currentBatchId) {
                console.log("TransactionsContext - loading Transactions");
                getTransactions(currentBatchId).then((res) => setProcessedTransactionsMap(res));
                setUpdate(false);
            }
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    const value = {getTransactions};
    return <ProcessedTransactionsContext.Provider value={value}>{children}</ProcessedTransactionsContext.Provider>
};
