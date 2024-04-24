import {createContext, useEffect, useState} from "react";

export const CategoriesContext = createContext({
    categories: [],
    setCategories: () => null,
});

export const CategoriesProvider = ({children}) => {
    const [categoriesMap, setCategoriesMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getCategories = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/categories`
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

        const url = `${process.env.REACT_APP_PROCESSOR}/resources/categories`;
        const response = await fetch(url, requestOptions);
        await response.json();
        setUpdate(true);
    }

    const updateCategory = async (id, value, is_tax_deductible, notes) => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": value,
                "notes": notes,
                "is_tax_deductible": is_tax_deductible
            })
        };
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/categories/` + id;
        const response = await fetch(url, requestOptions);
        await response.json();
        setUpdate(true);
    }

    useEffect(() => {
        getCategories().then((res) => setCategoriesMap(res));
        setUpdate(false);
    }, [update===true]);

    const value = {categoriesMap, setCategoriesMap, addCategory, updateCategory};
    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
};
