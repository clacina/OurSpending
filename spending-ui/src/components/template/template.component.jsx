import {useEffect, useState} from "react";

import 'react-dropdown/style.css';

import {TemplateContainer} from "./template.component.styles";
import EntityList from "../entity-list/entity-list.component";

/*
    {
        "id": 23,
        "institution": {
            "id": 4,
            "key": "WF",
            "name": "Wells Fargo"
        },
        "entity": {
            "id": 34,
            "value": "Fee"
        },
        "qualifiers": [
            {
                "id": 24,
                "value": "ATM - "
            }
        ],
        "tags": [
            {
                "id": 9,
                "value": "Fee"
            }
        ],
        "credit": false,
        "hint": "ATM Withdrawal",
        "notes": "Fines and Penalties"
    }

   {
        "institution_id": 1,
        "entity": "Interest",
        "credit": false,
        "tags": [],
        "qualifiers": [
            "Wellsfargo Checking"
        ],
        "hint": "Interest Payment",
        "notes": null,
        "id": 15
    },

*/

const templateData = {
    id: "",
    hint: "",
    notes: "",
    qualifiers: [],
    credit: "",
    tags: [],
    institution: null,
    category: ""
}

const TemplateDetailComponent = ({template, eventHandler}) => {
    const [templateFields, setTemplateFields] = useState(templateData);
    const {credit} = templateFields;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!isLoaded && template.institution !== null) {
            if(template.notes === null) {
                setTemplateFields({...template, 'notes': ''});
            } else {
                setTemplateFields(template);
            }
            setIsLoaded(true);
        }
    }, [template, template.institution]);

    function updateCredit(event) {
        setTemplateFields({...templateFields, 'credit': event.target.checked});
    }

    async function handleSubmit(event) {
        event.preventDefault();  // don't have form clear screen
        console.log("handleSubmit: ", event);
        // Store Data
        try {
        } catch (error) {
            console.log("Error storing template: ", error);
            return false;
        }

        return true;
    }

    if (isLoaded) {
        return (
            <TemplateContainer>
                <form onSubmit={handleSubmit}>
                    <span>Qualifiers: </span><EntityList nodes={templateFields.qualifiers}/>
                    <label>Is Credit</label>
                    <input type='checkbox' value={credit} onChange={updateCredit} name='credit'/>
                </form>

            </TemplateContainer>
        )
    }
}

export default TemplateDetailComponent;
