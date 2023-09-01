import {createContext, useEffect, useState} from "react";

const tagData = [
    {
        "id": 1,
        "value": "Cable Addition"
    },
    {
        "id": 2,
        "value": "Concert"
    },
    {
        "id": 3,
        "value": "Interest Payment"
    },
    {
        "id": 4,
        "value": "Recurring"
    },
    {
        "id": 5,
        "value": "Credit Card"
    },
    {
        "id": 6,
        "value": "Gas"
    },
    {
        "id": 7,
        "value": "Loan"
    },
    {
        "id": 8,
        "value": "Transfer"
    }
]

export const TagsContext = createContext({
    tags: [],
    setTags: () => null,
});

export const TagsProvider = ({children}) => {
    const [tagsMap, setTagsMap] = useState([]);

    useEffect(() => {
        setTagsMap(tagData);
        // because we're calling an async function, we need an async handler
        // const getCategoriesMap = async () => {
        //     const categoryMap = await getCategoriesAndDocuments();
        //     setCategoriesMap(categoryMap);
        // }
        // getCategoriesMap();
    }, []);

    const value = {tagsMap, setTagsMap};
    return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
};
