import TemplateComponent from "./template.component";
import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext, useEffect, useState} from "react";
import Collapsible from 'react-collapsible';
import '../collapsible.scss';

const BankComponent = ({bankData}) => {
    const {institutions} = useContext(StaticDataContext);

    const bankId = bankData[0];
    const templateBreakdown = Object.values(bankData[1]);
    const bank = institutions.find((i) => i.id == bankId);
    const title = `${bank.name} - ${templateBreakdown.length} Templates`;
    templateBreakdown.forEach((template) => {
        console.log(`BC Template ${bankId}: `, template);
    });

    return(
        <Collapsible trigger={title}>
            {templateBreakdown.map((template) => {
                return(<TemplateComponent
                    key={template[0].id}
                    bank={bankId}
                    templateTransactions={[template[0].template_id, template]}
                />)
            })}
        </Collapsible>
    )
}

export default BankComponent;
