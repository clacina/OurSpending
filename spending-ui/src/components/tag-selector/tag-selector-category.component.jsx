import React from 'react';

import chroma from 'chroma-js';
import { ColourOption } from './data.tsx';
import Select, { StylesConfig } from 'react-select';

import jsLogger from '../../utils/jslogger.js';


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

const TagSelectorForCategories = ({tagsMap, transaction, onChange}) => {
    const changeTag = (event) => {
        // update transaction tags list
        transaction.tags = event
        // console.log("Change Tag: ", event);
        onChange(transaction.id, event);
    }

    const tagColourOptions = []
    tagsMap.forEach((item) => {
        const tagOption = {}
        tagOption['value'] = item.id;
        tagOption['label'] = item.value;
        tagOption['color'] = item.color;
        tagColourOptions.push(tagOption);
    });
    // console.log("Transaction: ", transaction);
    const assigned = []
    transaction.transaction.tags.forEach((tag) => {
        assigned.push(tagColourOptions.find((item) => {
            return (item['value'] === tag.id)
        }))
    })
    // console.log("Setting assinged to: ", assigned);

    return (
        <Select
            closeMenuOnSelect={true}
            defaultValue={assigned}
            isMulti
            onChange={changeTag}
            options={tagColourOptions}
            styles={colourStyles}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
        />
    );
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