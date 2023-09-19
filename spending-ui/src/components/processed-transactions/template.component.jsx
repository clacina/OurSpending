import {useContext} from "react";

import Collapsible from 'react-collapsible';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {nanoid} from 'nanoid';

import {StaticDataContext} from "../../contexts/static_data.context";
import {templates} from '../../assets/data/templates.jsx';


const TemplateComponent = ({bank, templateTransactions}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const templateId = templateTransactions[0];
    const transactionList = templateTransactions[1];
    const transactions = [];

    transactionList.forEach((i) => {
        const newTrans = i.transaction;
        // Create unique keyid per row
        newTrans.keyid = nanoid();
        transactions.push(i.transaction);
    })

    // Build our title string
    const workingTemplate = templates.find((i) => Number(i.id) === Number(templateId));
    var title = "Template Transactions"
    if (workingTemplate) {
        title = `${workingTemplate.hint} - (Institution: ${bank}) Template: ${templateId}, ${transactions.length} Transactions `;
    }

    // Create column definitions for this institution
    const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(bank));
    const columns = [];
    dataDefinition.forEach((x) => {
        if(x.data_id) {
            columns.push({
                dataField: x.data_id,
                text: x.column_name
            });
        }
    });
    columns.push({dataField: 'keyid', text: '', isDummyField: true})

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
