import {createContext, useEffect, useState} from "react";

export const CategoriesContext = createContext({
    categories: [],
    setCategories: () => null,
});

export const CategoriesProvider = ({children}) => {
    const [categoriesMap, setCategoriesMap] = useState([]);

    const getCategories = async () => {
        const url = 'http://localhost:8000/resources/categories'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        getCategories().then((res) => setCategoriesMap(res));
        // because we're calling an async function, we need an async handler
        // const getCategoriesMap = async () => {
        //     const categoryMap = await getCategoriesAndDocuments();
        //     setCategoriesMap(categoryMap);
        // }
        // getCategoriesMap();
    }, []);

    const value = {categoriesMap, setCategoriesMap};
    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
};
