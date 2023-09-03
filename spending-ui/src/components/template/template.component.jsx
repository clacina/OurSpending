import {useContext, useEffect, useState} from "react";

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import {TemplateContainer} from "./template.component.styles";
import EntityList from "../entity-list/entity-list.component";
import FormInput from "../form-input/form-input.component";
import {CategoriesContext} from "../../contexts/categories.context";
import {TagsContext} from "../../contexts/tags.context";


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

const templateData = {
    id: "",
    hint: "",
    notes: "",
    qualifiers: [],
    credit: "",
    tags: [],
    institution: "",
    category: ""
}

const Template = ({template}) => {
    const [templateFields, setTemplateFields] = useState(templateData);
    const {hint, notes, credit} = templateFields;

    const {categoriesMap} = useContext(CategoriesContext);
    const {tagsMap} = useContext(TagsContext);

    useEffect(() => {
        setTemplateFields(template);
    }, [template]);

    function updateCategory(event) {
        const existingCategory = categoriesMap.find((item) => event.value === item.value);
        setTemplateFields({...templateFields, 'category': existingCategory});
    }

    function addTag(event) {
        const existingTag = tagsMap.find((item) => event.value === item.value);
        const newTagSet = [...templateFields.tags, {...existingTag}];
        setTemplateFields({...templateFields, 'tags': newTagSet});
    }

    // generic handler for hint and notes
    function handleChange(event) {
        const {name, value} = event.target;
        setTemplateFields({...templateFields, [name]: value});
    }

    function updateCredit(event) {
        console.log("Update credit: ", event.target.checked);
        setTemplateFields({...templateFields, 'credit': event.target.checked});
    }

    return (
        <TemplateContainer>
            <p>Institution: {templateFields.institution.name}</p>
            <p>Template ID: {templateFields.id}</p>
            <p>{templateFields.qualifiers.map((item) => item.value)}</p>
            <p>{templateFields.credit}</p>
            <p>{templateFields.tags.map((item) => item.value)}</p>
            <p>Category: {templateFields.category.value}</p>
            <p>{templateFields.notes}</p>

            <form>
                <FormInput label='Hint'
                           name='hint'
                           value={hint}
                           onChange={handleChange}/>
                <FormInput label='Notes'
                           name='notes'
                           value={notes}
                           onChange={handleChange}/>
                <span>Qualifiers: </span><EntityList nodes={templateFields.qualifiers}/>
                <span>Tags: </span><EntityList nodes={templateFields.tags}/>
                <input type='checkbox' value={credit} onChange={updateCredit} name='credit'/>
                <span> Is Credit</span>
                <Dropdown placeholder='Change Category' options={categoriesMap}
                          onChange={updateCategory}/>
                <Dropdown placeholder='Add Tag' options={tagsMap}
                          onChange={addTag}/>
            </form>

        </TemplateContainer>
    )
}

export default Template;
