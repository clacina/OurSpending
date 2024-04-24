import {createContext, useEffect, useState} from "react";
// import send from "../utils/http_client";

export const SavedFiltersContext = createContext({
    filters: [],
    setFilters: () => null,
});

export const SavedFiltersProvider = ({children}) => {
    const [filtersMap, setFiltersMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getFilters = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/saved_filters`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            console.log("SavedFiltersContext - loading...");
            getFilters().then((res) => setFiltersMap(res));
            setUpdate(false);
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    const value = {filtersMap, setFiltersMap, setUpdate};
    return <SavedFiltersContext.Provider value={value}>{children}</SavedFiltersContext.Provider>
};
