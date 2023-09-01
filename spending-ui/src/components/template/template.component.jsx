import {useContext, useState} from "react";

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

const Template = ({template}) => {
    const {id, hint, notes, qualifiers, credit, tags, institution, category} = template;
    const {categoriesMap} = useContext(CategoriesContext);
    const {tagsMap} = useContext(TagsContext);
    const [currentCategory, setCurrentCategory] = useState(category.value);
    const [currentTags, setCurrentTags] = useState(tags);

    function updateCategory(event) {
        console.log('Category change: ', event);
        setCurrentCategory(event.value);
    }

    function addTag(event) {
        console.log('tag change: ', event);
        const newTag = tagsMap.find(event.value);
        setCurrentTags([...currentTags, {...newTag}])
    }

    return (
        <TemplateContainer>
            <p>Institution: {institution.name}</p>
            <p>Template ID: {id}</p>
            <p>{qualifiers.map((item) => item.value)}</p>
            <p>{currentCategory}</p>
            <p>{currentTags.map((item) => item.value)}</p>

            <p>{notes}</p>
            <form>
                <FormInput label='Hint' value={hint}/>
                <span>Qualifiers: </span><EntityList nodes={qualifiers}/>
                <span>Tags: </span><EntityList nodes={tags}/>
                <input type='checkbox' value={credit}/>
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
