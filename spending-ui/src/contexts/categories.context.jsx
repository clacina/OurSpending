import {createContext, useEffect, useState} from "react";

const categoryData = [
    {
        "id": 1,
        "value": "Unknown"
    },
    {
        "id": 2,
        "value": "Amazon"
    },
    {
        "id": 3,
        "value": "Cash"
    },
    {
        "id": 4,
        "value": "Chris's Training / Development"
    },
    {
        "id": 5,
        "value": "Credit Card Payment"
    },
    {
        "id": 6,
        "value": "Entertainment"
    },
    {
        "id": 7,
        "value": "Fast Food/Restaurant"
    },
    {
        "id": 8,
        "value": "Gas"
    },
    {
        "id": 9,
        "value": "Goods"
    },
    {
        "id": 10,
        "value": "Groceries"
    },
    {
        "id": 11,
        "value": "Hobby"
    },
    {
        "id": 12,
        "value": "Home Improvement Supplies"
    },
    {
        "id": 13,
        "value": "Interest"
    },
    {
        "id": 14,
        "value": "Loan"
    },
    {
        "id": 15,
        "value": "Medical Bill"
    },
    {
        "id": 16,
        "value": "Payment"
    },
    {
        "id": 17,
        "value": "PayPal Purchase"
    },
    {
        "id": 18,
        "value": "Pharmacy"
    },
    {
        "id": 19,
        "value": "Professional Services"
    },
    {
        "id": 20,
        "value": "Salary"
    },
    {
        "id": 21,
        "value": "Service"
    },
    {
        "id": 22,
        "value": "Thrift Store"
    },
    {
        "id": 23,
        "value": "Transfer From"
    },
    {
        "id": 24,
        "value": "Transfer To"
    },
    {
        "id": 25,
        "value": "TUV"
    },
    {
        "id": 26,
        "value": "Utility"
    },
    {
        "id": 27,
        "value": "Vet"
    },
    {
        "id": 28,
        "value": "iPhone"
    },
    {
        "id": 29,
        "value": "Return"
    },
    {
        "id": 30,
        "value": "Rent"
    }
]

export const CategoriesContext = createContext({
    categories: [],
    setCategories: () => null,
});

export const CategoriesProvider = ({children}) => {
    const [categoriesMap, setCategoriesMap] = useState([]);

    useEffect(() => {
        setCategoriesMap(categoryData);
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
