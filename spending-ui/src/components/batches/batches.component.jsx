import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import './batches.component.styles.css';
import {BatchesContext} from "../../contexts/batches.context";
import {BatchContentsContext} from "../../contexts/batch_contents.context";
import Select from "react-select";

const BatchesComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const {batches} = useContext(BatchesContext);
    const {batchContentsMap} = useContext(BatchContentsContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    setSectionTitle('Transaction Batches');

    const dateColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        var utc = new Date(row.run_date);
        var offset = 0;  // utc.getTimezoneOffset();
        return(new Date(utc.getTime() + offset * 60000).toLocaleString());
    }

    const notesColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        // get any content info for the specified row
        const batchContent = Object.entries(batchContentsMap).filter((item) => {
            console.log("RowBatch: ", row)
            return(item[1].batch_id === row.id);
        })
        if(batchContent.length) {
            console.log("BC: ", batchContent);
            return ("--" + row.notes + " - " + batchContent[0][1].filename);
        }
        return ("--" + row.notes);
    }

    const batchInfoColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const batchContent = Object.entries(batchContentsMap).filter((item) => {
            return(item[1].batch_id === row.id);
        })
        if(batchContent.length) {
            console.log("BC: ", batchContent);
            var details = []
            batchContent.forEach((item) => {
                console.log("Item: ", item);
                /*
                    id
                    filename
                    institution_id
                    batch_id
                    added_date
                    file_date
                    transaction_count
                    notes
                 */
                const binfo = <li>{item[1].filename} - {item[1].added_date} has {item[1].transaction_count} transactions.</li>;
                details.push(binfo);
            })
            console.log("Details list: ", details);
            return (<ul>{details}</ul>);
        }
        return("-- No info available.");
    }

    const headerBackgroundColor = '#008080'
    const columns = [];
    columns.push(
        {
            dataField: 'id',
            text: 'Id',
            sort: true,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width:'60px',
            }
        })
    columns.push(
        {
            dataField: 'run_date',
            text: 'Run Date',
            sort: true,
            formatter: dateColumnFormatter,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width:'250px',
            }
        })
    columns.push(
        {
            dataField: 'notes',
            text: 'Notes',
            sort: true,
            formatter: notesColumnFormatter,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
            headerAttrs: {
                width:'500px',
            }
        })
    columns.push(
        {
            dataField: 'info',
            text: 'Details',
            sort: true,
            formatter: batchInfoColumnFormatter,
            headerStyle: {
                backgroundColor: headerBackgroundColor,
                color: 'white'
            },
        })


    useEffect(() => {
        console.log("Start");
        if (batches.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [batches]);

    const double_click_handler = (e, row, index) => {
        console.log("Double click: ", row.id);
        navigate('/transactions/' + row.id);
    }

    if(isLoaded) {
        return (
            <div id='batches_container'>
                <p>Double click a batch below to see the related transactions.</p>
                <TableBaseComponent columns={columns}
                                    data={batches}
                                    keyField='id'
                                    double_click_handler={double_click_handler}
                                    />
            </div>
        )
    } else {
        return(
            <div className='messagePanel'>
                <h1>No Batches Found</h1>
            </div>
        )
    }
}

export default BatchesComponent;
