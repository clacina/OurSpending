import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const ProcessedBatchesContext = createContext({
    processedBatches: [],
    setProcessedBatches: () => null,
});

export const ProcessedBatchesProvider = ({children}) => {
    const [processedBatches, setProcessedBatches] = useState([]);
    const [update, setUpdate] = useState(true);
    const headers = {'Content-Type': 'application/json'}

    const getBatches = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batches'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const updateBatchNotes = async (batch_id, note) => {
        const body = {"notes": note}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batch/' + batch_id;
        const method = 'POST'
        const request = await send(url, method, headers, body);
        setUpdate(true);
    }

    const getBatchDetails = async (batch_id) => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batch/' + batch_id;
        const method = 'GET'
        const response = await send(url, method, headers);

        var utc = new Date(response.run_date);
        var offset = utc.getTimezoneOffset();
        response.run_date = new Date(utc.getTime() + offset * 60000).toLocaleString();

        return (response);
    }

    const deleteBatches = async (batch_ids) => {
        var response;
        batch_ids.forEach(async (batch_id) => {
            response = deleteBatch(batch_id);
        });
        return(response);
    }

    const deleteBatch = async (batch_id) => {
        const method = 'DELETE'
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batch/' + batch_id;
        await send(url, method, headers, null);
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
        getBatchDetails,
        deleteBatches
    };
    return <ProcessedBatchesContext.Provider value={value}>{children}</ProcessedBatchesContext.Provider>
};
