import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const QualifiersContext = createContext({
    qualifiers: [],
    setQualifiers: () => null,
});

export const QualifiersProvider = ({children}) => {
    const [qualifiersMap, setQualifiers] = useState([]);
    const [update, setUpdate] = useState(true);

    const getQualifiers = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/qualifiers`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const createQualifier = async (value, institution_id) => {
        console.log("In CQ: " + value + "," + institution_id);
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/qualifiers`
        const body = {
            'value': value,
            'institution_id': institution_id,
        }
        const headers = {'Content-Type': 'application/json'}
        const method = 'POST'
        const request = await send(url, method, headers, body);
        console.log("New Qualifier: ", request);
        setUpdate(true);
        return(request.id);
    }

    useEffect(() => {
        getQualifiers().then((res) => setQualifiers(res));
        setUpdate(false);
    }, [update===true]);

    const value = {qualifiersMap, createQualifier};
    return <QualifiersContext.Provider value={value}>{children}</QualifiersContext.Provider>
};
