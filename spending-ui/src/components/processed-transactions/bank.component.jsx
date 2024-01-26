import TemplateComponent from "./template.component";
import {StaticDataContext} from "../../contexts/static_data.context";
import {InstitutionsContext} from "../../contexts/banks.context";
import {useContext, useEffect, useState} from "react";
import Collapsible from 'react-collapsible';

const BankComponent = ({bankData, eventHandler}) => {
    const {institutionsMap} = useContext(InstitutionsContext);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        if (institutionsMap && institutionsMap.length > 0) {
            setIsLoaded(true);
        } else {
            console.log("No banks yet...");
        }
    }, [institutionsMap.length]);

    if(isLoaded) {
        const bankId = bankData[0];
        const templateBreakdown = Object.values(bankData[1]);
        const bank = institutionsMap.find((i) => Number(i.id) === Number(bankId));
        const title = `${bank.name} - ${templateBreakdown.length} Templates`;

        return (
            <Collapsible trigger={title}>
                {templateBreakdown.map((template) => {
                    return (<TemplateComponent
                        key={template[0].id}
                        bank={bankId}
                        eventHandler={eventHandler}
                        templateTransactions={[template[0].template_id, template]}
                    />)
                })}
            </Collapsible>
        )
    }
}

export default BankComponent;
