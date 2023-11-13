import TemplateComponent from "./template.component";
import {StaticDataContext} from "../../contexts/static_data.context";
import {useContext, useEffect, useState} from "react";
import Collapsible from 'react-collapsible';

const BankComponent = ({bankData, eventHandler}) => {
    const {institutions} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        if (institutions && institutions.length > 0) {
            setIsLoaded(true);
        } else {
            console.log("No banks yet...");
        }
    }, [institutions.length]);

    if(isLoaded) {
        const bankId = bankData[0];
        const templateBreakdown = Object.values(bankData[1]);
        const bank = institutions.find((i) => Number(i.id) === Number(bankId));
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
