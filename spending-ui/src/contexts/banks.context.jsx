import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const InstitutionsContext = createContext({
    institutions: [],
    setInstitutions: () => null,
});

export const InstitutionsProvider = ({children}) => {
    const [institutionsMap, setInstitutionsMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getInstitutions = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/banks`
        console.log("URL: ", url);
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const updateInstitution = async (bank_id, body) => {
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/bank/` + bank_id;
        const method = 'PUT'
        console.log("Sending update: ", body);
        const request = await send(url, method, headers, body);
        console.log("Response: ", request);
        setUpdate(true);
    }

    useEffect(() => {
        getInstitutions().then((res) => setInstitutionsMap(res));
        setUpdate(false);
    }, [update===true]);

    const value = {institutionsMap, setInstitutionsMap, setUpdate, updateInstitution};
    return <InstitutionsContext.Provider value={value}>{children}</InstitutionsContext.Provider>
};
