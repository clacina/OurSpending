import {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import Dropdown from "react-dropdown";
import Button from "../button/button-component";
import {TagsContext} from "../../contexts/tags.context";
import 'react-dropdown/style.css';
import FormInput from "../form-input/form-input.component";

/*
  {
    "id": 23,
    "batch_id": 1,
    "institution_id": 4,
    "transaction_date": "2023-03-31",
    "transaction_data": [
      "03/31/2023",
      "04/02/2023",
      "AMZN Mktp US*HY6VE2851",
      "Shopping",
      "Sale",
      "-197.99",
      ""
    ],
    "tags": [],
    "description": "AMZN Mktp US*HY6VE2851",
    "amount": -197.99,
    "notes": []
  },
 */

const transactionData = {
    id: "",
    batch_id: "",
    notes: [],
    tags: [],
    institution_id: "",
    transactionDate: "",
    transactionData: {},
    description: "",
    amount: 0.0
}

const TransactionEntry = ({transaction}) => {
    const [transactionFields, setTransactionFields] = useState(transactionData);
    const [isLoading, setIsLoading] = useState(false);
    const [newNote, setNewNote] = useState("");
    const {transactionDataDefinitions, institutions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);

    useEffect(() => {
        if(transactionDataDefinitions.length !== 0 && institutions.length !== 0) {
            setIsLoading(true);
            setTransactionFields(transaction);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions, institutions]);

    function handleChange(event) {
        setNewNote(event.target.value);
    }

    const addNote = (event) => {
        event.preventDefault();  // don't have form clear screen
        console.log("newNote: ", newNote);
        const newNoteSet = [...transactionFields.notes, {transaction_id: transaction.id, value: newNote}];
        setTransactionFields({...transactionFields, 'notes': newNoteSet});
        setNewNote("");
    }

    const addTag = (event) => {
        const existingTag = tagsMap.find((item) => event.value === item.value);
        const newTagSet = [...transactionFields.tags, {...existingTag}];
        setTransactionFields({...transactionFields, 'tags': newTagSet});
    }

    if(isLoading) {
        const ourInstitution = institutions.find(i => i.id === transactionFields.institution_id);

        return (
            <div>
                <h1>Transaction</h1>
                <form>
                    <p>Transaction id: {transactionFields.id}</p>
                    <p>Batch id: {transactionFields.batch_id}</p>
                    <p>Bank: {ourInstitution.name}</p>
                    <p>Transaction Date: {transactionFields.transaction_date}</p>
                    <p>Description: {transactionFields.description}</p>
                    <p>Amount: {transactionFields.amount}</p>
                    <p>Tags: {transactionFields.tags.map((item) => item.value)}</p>
                    <p>Notes: {transactionFields.notes.map((item) => item.value)}</p>
                    <p>Transaction Data: {transactionFields.transaction_data}</p>
                    <Dropdown placeholder='Add Tag' options={tagsMap}
                              onChange={addTag}/>
                    <FormInput
                        label='New Note'
                        onChange={handleChange}
                        name="newNote"
                        value={newNote}
                    />
                    <button onClick={addNote}>Add</button>
                    <Button type='submit' id='submit'>Save</Button>
                </form>
            </div>
        )
    }
}

export default TransactionEntry;
