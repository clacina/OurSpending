import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";

const BanksComponent = () => {
    const {institutions, setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log("Start");
        if (institutions.length !== 0) {
            setSectionTitle('Banks');
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [institutions]);

    if(isLoaded) {
        const columns = [];
        columns.push({dataField: 'id', text: 'Id', sort: true})
        columns.push({dataField: 'key', text: 'Key', sort: true})
        columns.push({dataField: 'name', text: 'Name', sort: true})

        return (
            <div>
                <Row>
                    <TableBaseComponent columns={columns} data={institutions} keyField='id'/>
                </Row>
            </div>
        )
    }
}

export default BanksComponent;
