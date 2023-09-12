import Collapsible from 'react-collapsible';
import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext, useEffect, useState} from "react";


import {templates} from '../../data.jsx';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
// const logdown = require('logdown');
// const logger = logdown('template.component');
// localStorage.debug = '*';

import BootstrapTable from 'react-bootstrap-table-next';

const TemplateComponent = ({bank, templateTransactions}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    console.log("Got bank: ", bank);
    console.log("Column Defs: ", transactionDataDefinitions);

    const templateId = templateTransactions[0];
    const transactions = templateTransactions[1];
    const workingTemplate = templates.find((i) => i.id == templateId);
    var title = "Template Transactions"
    console.log("Found template: ", workingTemplate);
    if(workingTemplate) {
        title = `${workingTemplate.hint} - ${transactions.length} Transactions `;
    }
    const dataDefinition = transactionDataDefinitions.filter((x) => x.institution_id == bank);
    console.log("DD: ", dataDefinition);
    const dataNames = dataDefinition.map((column) => (
        column.column_name
    ));
    const columns = [];
    dataNames.forEach((x) => {
        columns.push({
            dataField: x,
            text: x
        });
    });
    // const columns = [{
    //     dataField: 'id',
    //     text: 'Product ID'
    // }, {
    //     dataField: 'name',
    //     text: 'Product Name'
    // }, {
    //     dataField: 'price',
    //     text: 'Product Price'
    // }];

    console.log("Columns: ", columns);
    return(
        <Collapsible trigger={title}>
            <BootstrapTable keyField='id' data={[]} columns={columns} />
        </Collapsible>
    )
}

export default TemplateComponent;
