import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import './batches.component.styles.css';
import {BatchesContext} from "../../contexts/batches.context";

const BatchesComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const {batches} = useContext(BatchesContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    setSectionTitle('Transaction Batches');

    const dateColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        var utc = new Date(row.run_date);
        var offset = utc.getTimezoneOffset();
        return(new Date(utc.getTime() + offset * 60000).toDateString());
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
                width:'100px',
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
                width:'300px',
            }
        })
    columns.push(
        {
            dataField: 'notes',
            text: 'Notes',
            sort: true,
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
    }
}

export default BatchesComponent;
