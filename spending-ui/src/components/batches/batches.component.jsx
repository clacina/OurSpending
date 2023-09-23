import React from "react";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";

const BatchesComponent = () => {
    const {batches} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

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
            <div>
                <Row>
                    <h1>Batches</h1>
                </Row>
                <Row>
                    <TableBaseComponent columns={columns}
                                        data={batches}
                                        keyField='id'
                                        double_click_handler={double_click_handler}
                                        />
                </Row>
            </div>
        )
    }
}

export default BatchesComponent;
