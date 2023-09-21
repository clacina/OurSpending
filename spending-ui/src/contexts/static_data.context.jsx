import {createContext, useEffect, useState} from "react";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    setTransactionDataDefinitions: () => null,
    institutions: [],
    setInstitutions: () => null,
    batches: [],
    setBatches: () => null,
    qualifiers: [],
    setQualifiers: () => null,
    processedBatches: [],
    setProcessedBatches: () => null
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [batches, setBatches] = useState([]);
    const [qualifiers, setQualifiers] = useState([]);
    const [processedBatches, setProcessedBatches] = useState([]);

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

    const getBatches = async () => {
        const url = 'http://localhost:8000/resources/batches'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getQualifiers = async () => {
        const url = 'http://localhost:8000/resources/qualifiers'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getProcessedBatches = async () => {
        const url = 'http://localhost:8000/resources/processed_batches'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getBanks().then((res) => setInstitutions(res));
            getTransactionDefinitions().then((res) => setTransactionDataDefinitions(res));
            getBatches().then((res) => setBatches(res));
            getQualifiers().then((res) => setQualifiers(res));
            getProcessedBatches().then((res) => setProcessedBatches(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const value = {
        transactionDataDefinitions,
        setTransactionDataDefinitions,
        institutions,
        setInstitutions,
        batches,
        setBatches,
        qualifiers,
        setQualifiers,
        processedBatches,
        setProcessedBatches
    };
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
