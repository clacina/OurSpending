import {createContext, useEffect, useState} from "react";

export const CategoriesContext = createContext({
    categories: [],
    setCategories: () => null,
});

export const CategoriesProvider = ({children}) => {
    const [categoriesMap, setCategoriesMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getCategories = async () => {
        const url = 'http://localhost:8000/resources/categories'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        setUpdate(false);
        return(str);
    };

    const addCategory = async (value, notes) => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": value,
                "notes": notes
            })
        };

        const url = 'http://localhost:8000/resources/categories';
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        setUpdate(true);
    }

    const updateCategory = async (id, value, notes) => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": value,
                "notes": notes
            })
        };
        const url = 'http://localhost:8000/resources/categories/' + id;
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        setUpdate(true);
    }

    useEffect(() => {
        getCategories().then((res) => setCategoriesMap(res));
        setUpdate(false);
    }, [update===true]);

    const value = {categoriesMap, setCategoriesMap, addCategory, updateCategory};
    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
};
