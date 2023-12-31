import {createContext, useEffect, useState} from "react";

export const ProcessedBatchesContext = createContext({
    processedBatches: [],
    setProcessedBatches: () => null,
});

export const ProcessedBatchesProvider = ({children}) => {
    const [processedBatches, setProcessedBatches] = useState([]);
    const [update, setUpdate] = useState(true);

    const getBatches = async () => {
        const url = 'http://localhost:8000/resources/processed_batches'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getBatches().then((res) => setProcessedBatches(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
        setUpdate(false);
    }, [update===true]);

    const value = {
        processedBatches,
        setUpdate
    };
    return <ProcessedBatchesContext.Provider value={value}>{children}</ProcessedBatchesContext.Provider>
};
