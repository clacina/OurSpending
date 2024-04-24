import {createContext, useEffect, useState} from "react";

export const StaticDataContext = createContext({
    transactionDataDefinitions: [],
    creditCardInfo: [],
    creditCardData: [],
    loanInfo: [],
    servicesInfo: [],
    sectionTitle: 'Section Title',
    setSectionTitle: () => null,
});

export const StaticDataProvider = ({children}) => {
    const [transactionDataDefinitions, setTransactionDataDefinitions] = useState([]);
    const [sectionTitle, setSectionTitle] = useState('Opening Section');
    const [creditCardInfo, setCreditCardInfo] = useState([]);
    const [creditCardData, setCreditCardData] = useState([]);
    const [loanInfo, setLoanInfo] = useState([]);
    const [servicesInfo, setServicesInfo] = useState([]);

    const getTransactionDefinitions = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/data_definitions`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getCreditCardInfo = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/credit_cards`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    const getCreditCardData = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/credit_card_data`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    const getLoanInfo = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/loans`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    const getServicesInfo = async () => {
        const url = `${process.env.REACT_APP_PROCESSOR}/resources/services`
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    }

    const updateCreditCardData = async (payload) => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        };

        const url = `${process.env.REACT_APP_PROCESSOR}/resources/credit_card_data`
        await fetch(url, requestOptions);
        getCreditCardInfo().then((res) => setCreditCardInfo(res));
    }

    useEffect(() => {
        try {
            getTransactionDefinitions().then((res) => setTransactionDataDefinitions(res));
            getCreditCardInfo().then((res) => setCreditCardInfo(res));
            getCreditCardData().then((res) => setCreditCardData(res));
            getLoanInfo().then((res) => setLoanInfo(res));
            getServicesInfo().then((res) => setServicesInfo(res));
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, []);

    const routines = {
        transactionDataDefinitions,
        sectionTitle,
        setSectionTitle,
        creditCardData,
        creditCardInfo,
        loanInfo,
        servicesInfo,
        updateCreditCardData
    };
    return <StaticDataContext.Provider value={routines}>{children}</StaticDataContext.Provider>
};
