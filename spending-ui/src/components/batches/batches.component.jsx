import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import './batches.component.styles.css';
import {BatchesContext} from "../../contexts/batches.context";
import {BatchContentsContext} from "../../contexts/batch_contents.context";

const BatchesComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const {batches} = useContext(BatchesContext);
    const {batchContentsMap} = useContext(BatchContentsContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    setSectionTitle('Transaction Batches');

    const dateColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        var utc = new Date(row.run_date);
        var offset = utc.getTimezoneOffset();
        return(new Date(utc.getTime() - offset * 60000).toLocaleString());
    }

    const notesColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        return (row.notes);
    }

    const batchInfoColumnFormatter2 = (cell, row, rowIndex, formatExtraData) => {
        const batchContent = Object.entries(batchContentsMap).filter((item) => {
            return(item[1].batch_id === row.id);
        })
        if(batchContent.length) {
            var details = []
            batchContent.forEach((item) => {
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
                var utc = new Date(item[1].added_date);
                var offset = utc.getTimezoneOffset();
                const added_date = new Date(utc.getTime() - offset * 60000).toLocaleString();

                const binfo = <tr>
                    <td>{item[1].filename}</td>
                    <td>{added_date}</td>
                    <td className='detailTransactions'>{item[1].transaction_count}</td>
                    <td>{item[1].notes}</td>
                </tr>;

                details.push(binfo);
            })
            return (
                <div className='batchContentsTable'>
                    <table>
                        <thead><tr><th>File</th><th>Added</th><th>Transactions</th><th>Notes</th></tr></thead>
                        <tbody>{details}</tbody>
                    </table>
                </div>
            );
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
                width:'300px',
            }
        })
    columns.push(
        {
            dataField: 'info',
            text: 'Details',
            sort: true,
            formatter: batchInfoColumnFormatter2,
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
