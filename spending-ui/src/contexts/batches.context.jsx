import {createContext, useEffect, useState} from "react";

export const BatchesContext = createContext({
    batches: [],
    setBatches: () => null,
});

export const BatchesProvider = ({children}) => {
    const [batches, setBatches] = useState([]);
    const [update, setUpdate] = useState(true);

    const getBatches = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/batches`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getBatches().then((res) => setBatches(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
        setUpdate(false);
    }, [update===true]);

    const value = {
        batches,
        setUpdate
    };
    return <BatchesContext.Provider value={value}>{children}</BatchesContext.Provider>
};
