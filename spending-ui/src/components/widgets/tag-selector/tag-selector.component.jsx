import React, {useEffect, useRef} from 'react';
import CreatableSelect from 'react-select/creatable';

import {colourStyles, BuildOptions} from "./tag-selector-base.component";
import Select from "react-select";


const TagSelector = ({tagsMap, entity, onChange, clearEntry,
                         canCreate=false, selectorId='tagSelection',
                         selectorClass='tagSelectDiv'}) => {
    // entity must contain 2 members:
    //  -- .id
    //  -- .tags
    const tagSelectionRef = useRef();
    // console.log("Tags Map: ", tagsMap);

    useEffect(() => {
        if(clearEntry !== undefined) {
            console.log("tsc - clear: ", clearEntry);
            tagSelectionRef.current.clearValue();
        }
    }, [clearEntry]);

    const {assigned, tagColourOptions} = BuildOptions(tagsMap, entity);

    const changeTag = (event) => {
        // update entity tags list
        entity.tags = event
        console.log("Change Tag: ", event);
        onChange(entity.id, event);
    }

    const handleCreate = (inputValue: string) => {
        console.log("In HandleCreate: ", inputValue);
        onChange(entity.id, inputValue);

    };

    if(canCreate) {
        return (
            <div className={selectorClass}>
                <CreatableSelect
                    onChange={changeTag}
                    closeMenuOnSelect={true}
                    defaultValue={assigned}
                    isMulti
                    options={tagColourOptions}
                    styles={colourStyles}
                    menuPortalTarget={document.body}
                    onCreateOption={handleCreate}
                    id={selectorId}
                    ref={tagSelectionRef}
                />
            </div>
        );
    } else {
        return (
            <div className={selectorClass}>
                <Select
                    onChange={changeTag}
                    closeMenuOnSelect={true}
                    defaultValue={assigned}
                    isMulti
                    options={tagColourOptions}
                    styles={colourStyles}
                    menuPortalTarget={document.body}
                    // onCreateOption={handleCreate}
                    id={selectorId}
                    ref={tagSelectionRef}
                />
            </div>
        );

    }
}

export default TagSelector;
