import React, {useContext, useEffect, useState} from "react";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import BootstrapTable from "react-bootstrap-table-next";
import assert from "assert";
import {StaticDataContext} from "../../../contexts/static_data.context";
import {InstitutionsContext} from "../../../contexts/banks.context";
import TagSelectorCategoryComponent from "../tag-selector/tag-selector-category.component";
import {TagsContext} from "../../../contexts/tags.context";

/*
        'transaction_id': e.transaction_id,
        'current_template': e.template_id,
        'current_category': e.category_id,
        'transaction_data': e.transaction_data
 */


const TransactionList = ({institution_id, transactions, batch_id}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {institutionsMap} = useContext(InstitutionsContext);
    const [ourInstitution, setOurInstitution] = useState("");
    const [columns, setColumns] = useState([]);
    const {tagsMap} = useContext(TagsContext);
    const [formattedTransactions, setFormattedTransactions] = useState([]);

    const getDataColumns = () => {
        const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(institution_id));

        const dateColumn = dataDefinition.find((item) => {
            return(item.is_transaction_date);
        });
        assert(dateColumn);

        // Amount Column
        const amountColumn = dataDefinition.find((item) => {
            return(item.is_amount);
        })
        assert(amountColumn);

        // Description Column
        const descriptionColumn = dataDefinition.find((item) => {
            return(item.is_description);
        })
        assert(descriptionColumn);

        return([dateColumn.column_number, amountColumn.column_number, descriptionColumn.column_number]);
    }


    useEffect(() => {
        if(transactionDataDefinitions.length !== 0 && institutionsMap.length !== 0 && transactions.length !== 0 && !isLoaded) {
            const inst = institutionsMap.find((i) => {
                return (i.id === institution_id)
            })
            setOurInstitution(inst);
            console.log("Transactions: ", transactions);
            // reformat transactions
            let reformattedTransactions = []
            transactions.forEach((item) => {
                console.log("Transaction: ", item);
                const newItem = {

                }
                reformattedTransactions.push(newItem);
            })
            setFormattedTransactions(reformattedTransactions);
            generateColumns();

            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, institutionsMap.length, institutionsMap, tagsMap]);

    const generateColumns = () => {
        //-------------- Configure our table -----------------------------
        const headerBackgroundColor = '#008080'
        const columnInfo = getDataColumns();
        const dateColumn = columnInfo[0];
        const amountColumn = columnInfo[1];
        const descriptionColumn = columnInfo[2];

        // Create column definitions for this institution
        // const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(institution_id));
        // console.log("DD: ", dataDefinition);
        const cols = [];

        // Build in order - Date, Amount, Description
        var text_align = 'right';
        var column_type = 'number'

        // Date Column
        console.log("Date column: ", dateColumn);
        cols.push({
            dataField: dateColumn.data_id,
            text: 'Date',
            type: column_type,
            align: 'left',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '100px',
            }
        });

        /*
        // Amount Column
        cols.push({
            dataField: amountColumn.data_id,
            text: 'Amount',
            type: column_type,
            align: text_align,
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: amountColumnFormatter,
            headerAttrs: {
                width: '100px',
            }
        });

        // Description Column
        var col_width = '500px';
        text_align = 'left';
        column_type = 'string';
        cols.push({
            dataField: descriptionColumn.data_id,
            text: 'Description',
            type: column_type,
            align: text_align,
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: col_width,
            }
        });

        // Add Tags and Notes columns

        cols.push({
            dataField: 'transaction.tags', text: 'Tags',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width: '250px'
            },
            formatter: tagColumnFormatter,
            style: {cursor: 'pointer'}
        })

        cols.push({
            dataField: 'transaction.notes', text: 'Notes',
            resize: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            formatter: noteColumnFormatter,
            style: {cursor: 'pointer'}
        })
        columns.push({dataField: 'id', text: '', hidden: true})
        */
        setColumns(cols);
    }

    //-------------------- Event Handlers ---------------------------------
    const noteColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        let note_list = '';
        if(row.notes) {
            note_list = row.notes.map((note) => {
                return (note.note + " ");
            })
        }
        return (<div>{note_list}</div>);
    }

    function compareTags(a, b) {
        return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const entity_info = {
            id: row.id,
            tags: row.tags
        }
        return (<TagSelectorCategoryComponent
            tagsMap={tagsMap.sort(compareTags)}
            entity={entity_info}
            canCreate={true}/>);
    }

    const amountColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return((Math.round(cell * 100) / 100).toFixed(2));
    }

    if(isLoaded) {
        return (
            <div>
                <BootstrapTable
                    keyField='keyid'
                    data={transactions}
                    columns={columns}
                />
             </div>
        )
    }
}

export default TransactionList;
