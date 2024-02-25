import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";
import assert from "assert";

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
        console.log("Create Template");
        if(payload !== undefined) {
            const headers = {'Content-Type': 'application/json'}
            const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/templates';
            const method = 'POST'
            console.log("Sending update: ", payload);
            const response = await send(url, method, headers, payload);
            console.log("Response: ", response);
            setUpdate(true);
            return (response);
        }
    }

    const getTemplateMatches = async (payload) => {
        console.log("getTemplateMatches: ", payload);
        if(payload !== undefined) {
            assert('batch_id' in payload);
            // assert('template_id' in payload);
            const headers = {'Content-Type': 'application/json'}
            let url = '';
            if('template_id' in payload && payload['template_id']) {
                url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batch/' + payload['batch_id'] + '/match_template/' + payload['template_id'];
            } else if('qualifiers' in payload && payload['qualifiers'].length > 0) {
                url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/processed_batch/' + payload['batch_id'] + '/match_qualifiers/';
            } else {
                return("Invalid payload");
            }
            const method = 'POST'
            console.log("Sending update: ", payload);
            const response = await send(url, method, headers, payload);
            console.log("Response: ", response);
            return (response);
        }
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

    const value = {
        templatesMap,
        setTemplatesMap,
        setUpdate,
        updateTemplate,
        getTemplateQualifiers,
        createTemplate,
        getTemplateMatches
    };
    return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>
};
