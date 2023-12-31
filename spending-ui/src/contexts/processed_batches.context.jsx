import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

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

    const updateBatchNotes = async (batch_id, note) => {
        const body = {"notes": note}
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/processed_batch/' + batch_id;
        const method = 'POST'
        const request = await send({url}, {method}, {headers}, {body});
        setUpdate(true);
    }

    const getBatchDetails = async (batch_id) => {
        const url = 'http://localhost:8000/resources/processed_batch/' + batch_id;
        const headers = {'Content-Type': 'application/json'}
        const method = 'GET'
        const response = await send({url}, {method}, {headers}, {});

        var utc = new Date(response.run_date);
        var offset = utc.getTimezoneOffset();
        response.run_date = new Date(utc.getTime() + offset * 60000).toDateString();

        return (response);
    }

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
        setUpdate,
        updateBatchNotes,
        getBatchDetails
    };
    return <ProcessedBatchesContext.Provider value={value}>{children}</ProcessedBatchesContext.Provider>
};
