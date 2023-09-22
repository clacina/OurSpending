import {createContext, useEffect, useState} from "react";

export const TemplatesContext = createContext({
    templates: [],
    setTemplates: () => null,
});

export const TemplatesProvider = ({children}) => {
    const [templatesMap, setTemplatesMap] = useState([]);

    const getTemplates = async () => {
        const url = 'http://localhost:8000/resources/templates'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getTemplates().then((res) => setTemplatesMap(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const value = {templatesMap, setTemplatesMap};
    return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>
};
