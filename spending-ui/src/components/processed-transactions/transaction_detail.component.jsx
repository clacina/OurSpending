import React, {useContext} from "react";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {ItemTable} from './transaction_detail.component.styles.jsx';


const TransactionDetailComponent = ({row}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === row.institution_id);

    const tableDef = []
    for(let i=0;i<dataDefinition.length;i++) {
        const line = {}
        line.title = dataDefinition[i].column_name;
        line.value = row.transaction.transaction_data[i];
        tableDef.push(line);
    }

    return(
        <div>
            <h2>{row.transaction.institution.name}</h2>
            <ItemTable>
                <thead>
                    <tr>
                        <td>Field</td>
                        <td>Value</td>
                    </tr>
                </thead>
                <tbody>
                    {tableDef.map((item) => {
                        return(<tr><td>{item.title}</td><td>{item.value}</td></tr>);
                    })}
                </tbody>
            </ItemTable>
        </div>
    );
}

export default TransactionDetailComponent;
