import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";

const ProcessedBatches = () => {
    const {processedBatches, setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date', sort: true})
    columns.push({dataField: 'notes', text: 'Notes', sort: true})
    columns.push({dataField: 'transaction_batch_id', text: 'Transaction Batch', sort: true})
    columns.push({dataField: 'transaction_count', text: 'Transaction Count', sort: true})

    useEffect(() => {
        console.log("Start");
        if (processedBatches.length !== 0) {
            setSectionTitle('Processed Batches');
            setIsLoaded(true);
            console.log(processedBatches);
        } else {
            console.info("No definitions yet");
        }
    }, [processedBatches]);

    const double_click_handler = (e, row, index) => {
        navigate('/processed_transactions/' + row.id);
    }

    if(isLoaded) {
        return(
            <TableBaseComponent
                columns={columns}
                data={processedBatches}
                keyField='id'
                double_click_handler={double_click_handler}
            />
        )
    }
}

export default ProcessedBatches;
