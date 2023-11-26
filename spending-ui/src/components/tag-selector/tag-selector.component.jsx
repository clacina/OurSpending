import React, {useEffect, useRef} from 'react';

import Select from 'react-select';
import {colourStyles, BuildOptions} from "./tag-selector-base.component";


const TagSelector = ({tagsMap, entity, onChange, clearEntry, selectorId='tagSelection'}) => {
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

    return (
        <div className='tagSelectDiv'>
            <Select
                onChange={changeTag}
                closeMenuOnSelect={true}
                defaultValue={assigned}
                isMulti
                options={tagColourOptions}
                styles={colourStyles}
                menuPortalTarget={document.body}
                id={selectorId}
                ref={tagSelectionRef}
            />
        </div>
    );
}

export default TagSelector;
