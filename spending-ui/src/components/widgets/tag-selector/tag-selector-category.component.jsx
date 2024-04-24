import React from 'react';

import Select from 'react-select';
import {BuildOptions, colourStyles} from "./tag-selector-base.component";
import CreatableSelect from "react-select/creatable";


const TagSelectorForCategories = ({tagsMap, entity, onChange, canCreate=false}) => {

    const {assigned, tagColourOptions} = BuildOptions(tagsMap, entity);

    const changeTag = (event) => {
        // update entity tags list
        entity.tags = event
        console.log("Change Tag: ", entity);
        onChange(entity.id, event);
    }

    const handleCreate = (inputValue) => {
        console.log("In HandleCreate: ", inputValue);
        onChange(entity.id, inputValue);

    };

    if(canCreate) {
        return (
            <CreatableSelect
                onChange={changeTag}
                closeMenuOnSelect={true}
                defaultValue={assigned}
                key={assigned}
                hasValue={assigned !== null}
                isMulti
                options={tagColourOptions}
                onCreateOption={handleCreate}
                styles={colourStyles}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
            />
        );
    } else {
        return (
            <Select
                onChange={changeTag}
                closeMenuOnSelect={true}
                defaultValue={assigned}
                isMulti
                options={tagColourOptions}
                styles={colourStyles}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
            />
        );
    }
}

export default TagSelectorForCategories;


/**
 *
 id               | 1378
 batch_id         | 2
 institution_id   | 10
 transaction_date | 2023-05-03
 transaction_data | ["5/03/2023", "Loan Advance Credit Card Credit Card MCDONALD'S F35934 TACOMA WA", "Loan Advance Credit Card Credit Card MCDONALD'S F35934 TACOMA WA", "19.95", "debit", "Fast Food", "SELECT VISA", "", ""]
 description      | Loan Advance Credit Card Credit Card MCDONALD'S F35934 TACOMA WA
 amount           | 19.9500

 *
 */
