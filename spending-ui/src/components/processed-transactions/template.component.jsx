import {useContext} from "react";

import Collapsible from 'react-collapsible';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {nanoid} from 'nanoid';

import {StaticDataContext} from "../../contexts/static_data.context";
import {templates} from '../../assets/data/templates.jsx';

// const logdown = require('logdown');
// const logger = logdown('template.component');
// localStorage.debug = '*';


const TemplateComponent = ({bank, templateTransactions}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const templateId = templateTransactions[0];
    const transactionList = templateTransactions[1];
    const transactions = [];

    transactionList.forEach((i) => {
        const newTrans = i.transaction;
        newTrans.keyid = nanoid();
        transactions.push(i.transaction);
    })

    const workingTemplate = templates.find((i) => i.id == templateId);
    var title = "Template Transactions"
    if (workingTemplate) {
        title = `${workingTemplate.hint} - (Institution: ${bank}) Template: ${templateId}, ${transactions.length} Transactions `;
    }
    const dataDefinition = transactionDataDefinitions.filter((x) => x.institution_id == bank);
    const columns = [];
    dataDefinition.forEach((x) => {
        columns.push({
            dataField: x.data_id,
            text: x.name
        });
    });
    columns.push({dataField: 'keyid', text: ''})

    return (
        <Collapsible trigger={title}>
            <BootstrapTable
                keyField='keyid'
                data={transactions}
                columns={columns}
            />
        </Collapsible>
    )
}

export default TemplateComponent;
