import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";

const BatchesComponent = () => {
    const {batches, setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    setSectionTitle('Transaction Batches');

    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'run_date', text: 'Run Date', sort: true})
    columns.push({dataField: 'notes', text: 'Notes', sort: true})

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
            <TableBaseComponent columns={columns}
                                data={batches}
                                keyField='id'
                                double_click_handler={double_click_handler}
                                />
        )
    }
}

export default BatchesComponent;
