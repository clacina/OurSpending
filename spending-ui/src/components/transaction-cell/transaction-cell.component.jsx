import {StaticDataContext} from '../../contexts/static_data.context';
import {useContext} from "react";
const TransactionCell = ({transaction}) => {
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {id, institution, transaction_data} = transaction;
    /*
        products
            .filter((_, idx) => idx < 4)
            .map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
     */
    const dataDefinition = transactionDataDefinitions.filter((x, idx) => x.institution_id === institution.id);
    // console.log("DD: ", dataDefinition);
    // console.log("Trans_Def: ", transaction.transaction_data);
    const dataNames = dataDefinition.map((column) => (
        column.column_name
    ));
    // console.log("Found data def for institution: " + institution.id + " of " + dataDefinition.length);
    // console.log("--Names: ", dataNames);
    return(
        <div>

        </div>
    )
}

export default TransactionCell;
