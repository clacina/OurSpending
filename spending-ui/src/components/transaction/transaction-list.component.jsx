import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import React, {useContext, useEffect, useState} from "react";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
    PaginationListStandalone,
    PaginationTotalStandalone,
    SizePerPageDropdownStandalone
} from 'react-bootstrap-table2-paginator';

// https://flatuicolors.com/palette/fr

const TransactionList = ({institution_id, transactions}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions, institutions} = useContext(StaticDataContext);

    // Define table columns
    var columns = []

    useEffect(() => {
        if(transactionDataDefinitions.length !== 0 && institutions.length !== 0) {
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, institutions.length]);

    const generateColumns = () => {
        //-------------- Configure our table -----------------------------
        // Create column definitions for this institution
        const dataDefinition = transactionDataDefinitions.filter((x) => Number(x.institution_id) === Number(institution_id));
        const cols = [];
        dataDefinition.forEach((x) => {
            if (x.data_id) {
                // column_type     VARCHAR(20) REFERENCES transaction_column_types (data_type) DEFERRABLE,
                // is_description  BOOLEAN DEFAULT false,
                // is_amount       BOOLEAN DEFAULT false,
                var col_width = '150px';
                var text_align = 'right';
                if (x.is_description) {
                    col_width = '700px';
                    text_align = 'left';
                }
                var column_type = 'string';
                if (x.is_amount) {
                    column_type = 'number'
                }

                cols.push({
                    dataField: x.data_id,
                    text: x.column_name,
                    type: column_type,
                    align: text_align,
                    sort: true,
                    editable: false,
                    resize: true,
                    headerStyle: {
                        backgroundColor: '#6a89cc',
                        color: 'white'
                    },
                    headerAttrs: {
                        width: col_width,
                    }
                });
            }
        });

        cols.push({
            dataField: 'entity.tags', text: 'Tags',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: '#6a89cc',
                color: 'white'
            },
            headerAttrs: {
                width: '200px'
            }
        })

        cols.push({
            dataField: 'entity.notes', text: 'Notes',
            sort: true,
            editable: false,
            resize: true,
            headerStyle: {
                backgroundColor: '#6a89cc',
                color: 'white'
            },
            headerAttrs: {
                width: '400px',
            }
        })
        columns = cols;
    }

    if(isLoaded) {
        const ourInstitution = institutions.filter((i) => {
            return (i.id === institution_id)
        })

        generateColumns();

        return (
            <div key={ourInstitution[0].id}>
                <h1>{ourInstitution[0].name}</h1>
                <div>
                    <BootstrapTable
                        w-auto
                        keyField='keyid'
                        data={transactions}
                        columns={columns}
                        pagination={paginationFactory()}
                    />
             </div>
            </div>

        )
    }
}

export default TransactionList;
