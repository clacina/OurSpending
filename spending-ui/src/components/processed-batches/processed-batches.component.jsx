import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";

const ProcessedBatches = () => {
    const {processedBatches} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date', sort: true})
    columns.push({dataField: 'notes', text: 'Notes', sort: true})
    columns.push({dataField: 'transaction_batch_id', text: 'Transaction Batch', sort: true})

    useEffect(() => {
        console.log("Start");
        if (processedBatches.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [processedBatches]);

    if(isLoaded) {
        return(
            <div>
                <Row>
                    <h1>Processed Batches</h1>
                </Row>
                <Row>
                    <TableBaseComponent columns={columns} data={processedBatches} keyField='id'/>
                </Row>
            </div>
        )
    }
}

export default ProcessedBatches;
