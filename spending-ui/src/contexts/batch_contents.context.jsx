import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const BatchContentsContext = createContext({
    batchContentsMap: [],
    setBatchContentsMap: () => null,
});

export const BatchContentsProvider = ({children}) => {
    const [batchContentsMap, setBatchContentsMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getBatchContentsMap = async () => {
        const url = 'http://localhost:8000/resources/batch_contents'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        console.log("BatchContentsContext - loading...");
        getBatchContentsMap().then((res) => setBatchContentsMap(res));
        setUpdate(false);
    }, [update===true]);

    const value = {batchContentsMap, setBatchContentsMap, setUpdate};
    return <BatchContentsContext.Provider value={value}>{children}</BatchContentsContext.Provider>
};
