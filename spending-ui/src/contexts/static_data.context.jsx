import {createContext, useEffect, useState} from "react";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    setTransactionDataDefinitions: () => null,
    creditCardInfo: [],
    setCreditCardInfo: () => null,
    creditCardData: [],
    setCreditCardData: () => null,
    sectionTitle: 'Section Title',
    setSectionTitle: () => null,
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);
    const [sectionTitle, setSectionTitle] = useState('Opening Section');
    const [creditCardInfo, setCreditCardInfo] = useState([]);
    const [creditCardData, setCreditCardData] = useState([]);

    const getTransactionDefinitions = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/data_definitions'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getCreditCardInfo = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/credit_cards'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    const getCreditCardData = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/credit_card_data'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    useEffect(() => {
        try {
            getTransactionDefinitions().then((res) => setTransactionDataDefinitions(res));
            getCreditCardInfo().then((res) => setCreditCardInfo(res));
            getCreditCardData().then((res) => setCreditCardData(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const value = {
        transactionDataDefinitions,
        sectionTitle,
        setSectionTitle,
        creditCardData,
        creditCardInfo
    };
    return <StaticDataContext.Provider value={value}>{children}</StaticDataContext.Provider>
};
