import {createContext, useEffect, useState} from "react";

export const InstitutionsContext = createContext({
    institutions: [],
    setInstitutions: () => null,
});

export const InstitutionsProvider = ({children}) => {
    const [institutionsMap, setInstitutionsMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getInstitutions = async () => {
        const url = 'http://localhost:8000/resources/banks'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        getInstitutions().then((res) => setInstitutionsMap(res));
        setUpdate(false);
    }, [update===true]);

    const value = {institutionsMap, setInstitutionsMap, setUpdate};
    return <InstitutionsContext.Provider value={value}>{children}</InstitutionsContext.Provider>
};
