import React, {useContext, useEffect, useState} from "react";

import 'react-dropdown/style.css';
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";

import {TemplateContainer, TemplateCategoryDiv} from "./template.component.styles";
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
    const {categoriesMap} = useContext(CategoriesContext);
    const [templateFields, setTemplateFields] = useState(templateData);
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

    const updateCategory = (event) => {
        console.log("Update Category: ", event);
        console.log("For template: ", template);

        // contact parent to store....
        const payload = {
            template_id: template.id,
            category: {"id": event.value, "value": event.label}
        }
        eventHandler(payload);
    }

    // Sort comparator
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    // Format list
    const options = []
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    if (isLoaded) {
        const defaultValue={ label: template.category.value, value: template.category.id }

        return (
            <TemplateCategoryDiv>
                <span>Current Qualifiers</span><EntityList nodes={templateFields.qualifiers}/>
                <label>Assign Category</label>

                <TemplateContainer>
                    <Select
                        options={options.sort(compareCategories)}
                        onChange={updateCategory}
                        defaultValue={defaultValue}
                    />
                </TemplateContainer>
            </TemplateCategoryDiv>

        )
    }
}

export default TemplateDetailComponent;
