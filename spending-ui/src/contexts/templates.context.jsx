import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const TemplatesContext = createContext({
    templates: [],
    setTemplates: () => null,
});

export const TemplatesProvider = ({children}) => {
    const [templatesMap, setTemplatesMap] = useState([]);
    const [templateQualifiersMap, setTemplateQualifiersMap] = useState([]);
    const [update, setUpdate] = useState(true);
    const [updateQualifiers, setUpdateQualifiers] = useState(true);

    const getTemplates = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/templates'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        setUpdate(false);
        return(str);
    };

    const getQualifiers = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/template_qualifiers'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        setUpdateQualifiers(false);
        return(str);
    }

    const updateTemplate = async (template_id, body) => {
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/template/' + template_id;
        const method = 'PATCH'
        console.log("Sending update: ", body);
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
        setUpdate(true);
    }

    const getTemplateQualifiers = async (template_id) => {
        return templateQualifiersMap.filter((x, ndx) => {
            return (x.template_id === template_id)
        });
    }

    const createTemplate = async (payload) => {
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/templates';
        const method = 'POST'
        console.log("Sending update: ", payload);
        const response = await send(url, method, headers, payload);
        console.log("Response: ", response);
        setUpdate(true);
        return(response);
    }

    useEffect(() => {
        try {
            getTemplates().then((res) => setTemplatesMap(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    useEffect(() => {
        try {
            getQualifiers().then((res) => setTemplateQualifiersMap(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [updateQualifiers===true]);

    const value = {templatesMap, setTemplatesMap, setUpdate, updateTemplate, getTemplateQualifiers, createTemplate};
    return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>
};
