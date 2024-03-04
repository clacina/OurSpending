import {useContext} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import './faire.component.styles.css';


const Faire = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    setSectionTitle('Faire Cost Breakdown');
    const fordMPG = 16.2;
    const chevyMPG = 12.0;
    const orfDistance = 160;
    const wmrfDistance = 70;
    const costOfGas = 4.0;

    // setFirstHalfPayment('$'+Intl.NumberFormat().format(fh));

    return(
        <div id='page_container'>
            <p>Ford Mileage: {fordMPG} MPG</p>
            <p>Chevy Mileage: {chevyMPG} MPG</p>
            <p>Distance to ORF: {orfDistance} miles each way</p>
            <p>Distance to WMRF: {wmrfDistance} miles each way</p>
            <p>Cost of Gas: {'$'+Intl.NumberFormat().format(costOfGas)}</p>
            <hr/>
            <h3>Cost of Travel Each Way</h3>
            <p>ORF Travel Ford: {'$'+Intl.NumberFormat().format(orfDistance/fordMPG*costOfGas)}</p>
            <p>ORF Travel Chevy: {'$'+Intl.NumberFormat().format(orfDistance/chevyMPG*costOfGas)}</p>
            <p>WMRF Travel Ford: {'$'+Intl.NumberFormat().format(wmrfDistance/fordMPG*costOfGas)}</p>
            <p>WMRF Travel Chevy: {'$'+Intl.NumberFormat().format(wmrfDistance/chevyMPG*costOfGas)}</p>
        </div>
    )
}

export default Faire