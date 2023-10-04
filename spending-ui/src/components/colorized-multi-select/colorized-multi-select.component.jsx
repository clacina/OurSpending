import React from 'react';
import chroma from 'chroma-js';

import { ColourOption, colourOptions } from './data.tsx';
import Select, { StylesConfig } from 'react-select';


const colourStyles: StylesConfig<ColourOption, true> = {
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


const GetTagColor = () => {
    const colors = [
        { value: 'ocean', label: 'Ocean', color: '#00B8D9'},
        { value: 'blue', label: 'Blue', color: '#0052CC'},
        { value: 'purple', label: 'Purple', color: '#5243AA' },
        { value: 'red', label: 'Red', color: '#FF5630'},
        { value: 'orange', label: 'Orange', color: '#FF8B00' },
        { value: 'yellow', label: 'Yellow', color: '#FFC400' },
        { value: 'green', label: 'Green', color: '#36B37E' },
        { value: 'forest', label: 'Forest', color: '#00875A' },
        { value: 'slate', label: 'Slate', color: '#253858' },
        { value: 'silver', label: 'Silver', color: '#666666' },
    ]
    return(colors[(Math.floor(Math.random() * colors.length))].color);
}

const ColorizedMultiSelect = ({tagsMap}) => {
    const tagColourOptions = []
    tagsMap.forEach((item) => {
        const tagOption = {}
        tagOption['value'] = item.id;
        tagOption['label'] = item.value;
        tagOption['color'] = item.color;
        tagColourOptions.push(tagOption);
    });

    return (
        <Select
            closeMenuOnSelect={true}
            defaultValue={[tagColourOptions[0], tagColourOptions[1]]}
            isMulti
            options={tagColourOptions}
            styles={colourStyles}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
        />
    );
}

export default ColorizedMultiSelect;
