import {createContext, useEffect, useState} from "react";

export const TagsContext = createContext({
    tags: [],
    setTags: () => null,
});

export const TagsProvider = ({children}) => {
    const [tagsMap, setTagsMap] = useState([]);

    const getTags = async () => {
        const url = 'http://localhost:8000/resources/tags'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        try {
            getTags().then((res) => setTagsMap(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const value = {tagsMap, setTagsMap};
    return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
};
