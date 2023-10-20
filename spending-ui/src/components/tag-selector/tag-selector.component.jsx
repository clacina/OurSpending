import React, {useEffect, useRef, useState} from 'react';

import chroma from 'chroma-js';
import { ColourOption } from './data.tsx';
import Select, {StylesConfig} from 'react-select';


export const colourStyles: StylesConfig<ColourOption, true> = {
    control: (styles) => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: isDisabled
                ? undefined
                : isSelected
                    ? data.color
                    : isFocused
                        ? color.alpha(0.1).css()
                        : undefined,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(color, 'white') > 2
                        ? 'white'
                        : 'black'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',

            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled
                    ? isSelected
                        ? data.color
                        : color.alpha(0.3).css()
                    : undefined,
            },
        };
    },
    multiValue: (styles, { data }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
        };
    },
    multiValueLabel: (styles, { data }) => ({
        ...styles,
        color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
        ...styles,
        color: data.color,
        ':hover': {
            backgroundColor: data.color,
            color: 'white',
        },
    }),
};

const TagSelector = ({tagsMap, transaction, onChange, clearEntry}) => {
    const tagSelectionRef = useRef();

    useEffect(() => {
        if(clearEntry !== undefined) {
            console.log("tsc - clear: ", clearEntry);
            tagSelectionRef.current.clearValue();
        }
    }, [clearEntry]);

    const tagColourOptions = []
    tagsMap.forEach((item) => {
        const tagOption = {}
        tagOption['value'] = item.id;
        tagOption['label'] = item.value;
        tagOption['color'] = item.color;
        tagColourOptions.push(tagOption);
    });

    const assigned = []
    transaction.tags.forEach((tag) => {
        assigned.push(tagColourOptions.find((item) => {
            return (item['value'] === tag.id)
        }))
    })

    const changeTag = (event) => {
        // update transaction tags list
        transaction.tags = event
        console.log("Change Tag: ", event);
        onChange(transaction.id, event);
    }

    return (
        <Select
            onChange={changeTag}
            closeMenuOnSelect={true}
            ref={tagSelectionRef}
            defaultValue={assigned}
            isMulti
            id="tagSelection"
            options={tagColourOptions}
            styles={colourStyles}
            menuPortalTarget={document.body}
        />
    );
}

export default TagSelector;
