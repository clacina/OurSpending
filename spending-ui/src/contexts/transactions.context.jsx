import {createContext, useContext, useEffect, useState} from "react";
import send from "../utils/http_client";
import {TagsContext} from "./tags.context";

export const TransactionsContext = createContext({
    transactions: [],
    setTransactions: () => null,
});

export const TransactionsProvider = ({children}) => {
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [update, setUpdate] = useState(true);
    const [currentBatchId, setCurrentBatchId] = useState();
    const {addTag} = useContext(TagsContext);

    const getTransactions = async (batch_id) => {
        setCurrentBatchId(batch_id);
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/transactions/' + batch_id
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const updateTransaction = async(id, value, notes, color) => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": value,
                "notes": notes ? notes : '',
                "color": color
            })
        };
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/transaction/' + id;
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        console.log("Response: ", str);
    }

    const updateTransactionTags = async(transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        var body = []

        if(typeof tag_list === "string") {  // creating a new tag
            // Have TagContext handle adding the new tag to the system
            const newTagId = await addTag(tag_list, '', null);
            body.push(newTagId);
        } else {  // assign an existing tag
            tag_list.forEach((item) => {
                body.push(item.value);
            })
        }
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/transaction/' + transaction_id + '/tags';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        setUpdate(true);
    }

    const updateTransactionNotes = async (transaction_id, note) => {
        // var body = {'note': note}
        var body = []
        console.log("updateTransactionNotes: ", note);
        if (note) {
            note.forEach((item) => {
                console.log(item);
                if(typeof item === "string") {
                    console.log("--Note is string, not object")
                    body.push({"text": item})
                } else {
                    body.push({"id": item.id, "text": item.text})
                }
            })
        }

        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/transaction/' + transaction_id + '/notes';
        const method = 'POST'
        const request = await send({url}, {method}, {headers}, {body});
        setUpdate(true);
    }

    const updateTransactionCategory = async (transaction_id, category_id) => {
        const body = {
            'category_id': category_id
        }
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/resources/transaction/' + transaction_id + '/category';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        setUpdate(true);
    }

    useEffect(() => {
        try {
            console.log("TransactionsContext - loading Transactions");
            getTransactions(currentBatchId).then((res) => setTransactionsMap(res));
            setUpdate(false);
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    const value = {getTransactions, updateTransactionNotes, updateTransactionTags, updateTransactionCategory};
    return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
};
