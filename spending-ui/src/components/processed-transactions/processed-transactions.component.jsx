import {useParams} from "react-router-dom";
import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext, useEffect, useState} from "react";
import {processed_transactions} from "../../data.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import BankComponent from "./bank.component";

const ProcessedTransactions = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {templatesMap} = useContext(TemplatesContext);
    const [transactionsMap, setTransactionsMap] = useState([]);
    const routeParams = useParams();

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/processed_transactions/' + routeParams.batch_id;
        console.log("URL: ", url);
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    useEffect(() => {
        console.log("Start");
        getTransactions().then((res) => setTransactionsMap(res));

        if (transactionsMap.length !== 0 && transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, transactionsMap.length]);

    const groupTransactionsByTemplate = (entries) => {
        const templateEntries = {}

        entries.forEach((item) => {
            if(!templateEntries.hasOwnProperty(item.template_id)) {
                templateEntries[item.template_id] = [];
            }
            templateEntries[item.template_id].push(item);
        })
        return templateEntries;
    }

    if (isLoaded) {
        // Group transactions by institution
        const institution_groups = {}
        processed_transactions.forEach((t) => {
            if (!institution_groups.hasOwnProperty(t.institution_id)) {
                institution_groups[t.institution_id] = [];
            }
            t.transaction = transactionsMap.find((item) => {
                return (item.id === t.transaction_id)
            });
            t.template = null;
            if (t.template_id) {
                t.template = templatesMap.find((item) => {
                    return (item.id === t.template_id)
                })
            }
            institution_groups[t.institution_id].push(t);
        })

        const template_groups = {}
        for (const [key, value] of Object.entries(institution_groups)) {
            // console.log(key, value);
            template_groups[key] = groupTransactionsByTemplate(value);
        }

        const emap = Object.entries(template_groups);

        return (
            <div key='pb'>
                <h1>Processed Transactions</h1>
                {emap.map((bank) => {
                    console.log("Using bank: ", bank);
                    return(<BankComponent key={bank[0]} bankData={bank}/>)
                })}
            </div>
        )
    }
}

export default ProcessedTransactions;
