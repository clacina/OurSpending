import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext, useEffect, useState} from "react";
import {processed_transactions} from "../../data.jsx";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import BankComponent from "./bank.component";
import {TransactionsContext} from "../../contexts/transactions.context.jsx";

/*
processed_transaction_records
    processed_batch_id
    transaction_id
    template_id
    institution_id
    id
 */

// Grouped by institution
/*
    institution.name, key
    template.category_id -> category
    template.credit
    template.hint
    template_tags
    template.notes
    transaction.amount
    transaction.description
    transaction.transaction_date
 */

const ProcessedTransactions = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {transactionsMap} = useContext(TransactionsContext);
    const {templatesMap} = useContext(TemplatesContext);

    useEffect(() => {
        console.log("Start");
        if (transactionDataDefinitions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions]);

    // const getInstitutionName = (id) => {
    //     const entry = institutions.find((item) => {
    //         return(item.id === id);
    //     });
    //     return entry.name;
    // }

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
        // console.log("bank groupings");
        const template_groups = {}
        for (const [key, value] of Object.entries(institution_groups)) {
            // console.log(key, value);
            template_groups[key] = groupTransactionsByTemplate(value);
        }

        const emap = Object.entries(template_groups).slice(1, 2);

        return (
            <div key='pb'>
                <h1>Processed Transactions</h1>
                {emap.map((bank) => {
                    // console.log("Using bank: ", bank);
                    return(<BankComponent key={bank[0]} bankData={bank}/>)
                })}
            </div>
        )
    }
}

export default ProcessedTransactions;
