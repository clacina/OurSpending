import React, {useContext} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Item, Menu, Separator, Submenu} from "react-contexify";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";


const TransactionDetailComponent = ({row}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);

    console.log("Row: ", row);
    const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === row.institution_id);
    const columns = [];
    console.log("Dd: ", dataDefinition);
    dataDefinition.forEach((x) => {
        if(x.data_id) {
            columns.push({
                dataField: x.data_id,
                text: x.column_name,
                sort: true
            });
        }
    });

    columns.push({dataField: 'keyid', text: '', isDummyField: true, hidden: true})
    const processed_data = {}
    var ndx = 0;
    var colNdx = 0;
    row.transaction.transaction_data.forEach((item) => {
        if(dataDefinition[ndx].data_id) {
            const colName = columns[colNdx].dataField;
            console.log("col name: ", colName);
            processed_data[colName] = item;
            colNdx++;
        }
        ndx++;
    })
    console.log("new data: ", processed_data);


    return(
        <>
            <BootstrapTable
                keyField='keyid'
                data={[processed_data]}
                columns={columns}
            />
            {/*<Menu id="context-menu" theme='dark'>*/}
            {/*        <>*/}
            {/*            <Item className="text-center">Header row</Item>*/}
            {/*            <Separator/>*/}
            {/*            {["Google", "Apple"].includes("Google") && (*/}
            {/*                <Submenu label="Contact" arrow=">">*/}
            {/*                    <Item>Phone</Item>*/}
            {/*                    <Item>Email</Item>*/}
            {/*                </Submenu>*/}
            {/*            )}*/}
            {/*            <Item disabled={true}>Add to Cart</Item>*/}
            {/*        </>*/}
            {/*    )*/}
            {/*</Menu>*/}
        </>
    )
}

export default TransactionDetailComponent;
