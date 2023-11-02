import {useContext, useEffect, useState} from "react";

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import {TemplateContainer} from "./template.component.styles";
import EntityList from "../entity-list/entity-list.component";
import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";
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
    const {hint, notes, credit} = templateFields;
    const [isLoaded, setIsLoaded] = useState(false);

    const {categoriesMap} = useContext(CategoriesContext);
    const {tagsMap} = useContext(TagsContext);
    console.log("Using template: ", template);


    useEffect(() => {
        if (!isLoaded && template.institution !== null) {
            console.log("setting template: ", template);
            if(template.notes === null) {
                setTemplateFields({...template, 'notes': ''});
            } else {
                setTemplateFields(template);
            }
            console.log(templateFields);
            setIsLoaded(true);
        }
    }, [template, template.institution]);

    function updateCategory(event) {
        const existingCategory = categoriesMap.find((item) => event.value === item.value);
        setTemplateFields({...templateFields, 'transaction': existingCategory});
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

    async function handleSubmit(event) {
        event.preventDefault();  // don't have form clear screen
        console.log("handleSubmit: ", event);
        // Store Data
        try {
            // const {user} = await createAuthUserWithEmailAndPassword(email, password);
            // console.log('user: ', user);
            //
            // // Store our user in our context
            // // setCurrentUser(user);
            // await createUserDocumentFromAuth(user, {displayName});
            // resetFormFields();
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
