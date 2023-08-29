import {TemplateContainer} from "./template.component.styles";

/*
    {
        "id": 23,
        "institution": {
            "id": 4,
            "key": "WF",
            "name": "Wells Fargo"
        },
        "category": {
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
*/

const Template = ({template}) => {
    const {id, hint, notes, qualifiers, credit, tags, institution, category} = template;
    return(
        <TemplateContainer >
            <h2>{institution.name}</h2>
            <h2>{hint}</h2>
            <h2>{qualifiers.map((item) => item.value)}</h2>
            <h2>{category.value}</h2>
            <h2>{tags.map((item) => item.value)}</h2>

            <p>{notes}</p>
        </TemplateContainer>
    )
}

export default Template;
