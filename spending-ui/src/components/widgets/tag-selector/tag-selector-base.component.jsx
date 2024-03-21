import {StylesConfig} from "react-select";
import {ColourOption} from "./data.tsx";
import chroma from "chroma-js";

export const colourStyles: StylesConfig<ColourOption, true> = {
    control: (styles) => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        if(data.hasOwnProperty('__isNew__') && data.__isNew__) {
            // console.log("new tag so no data: ", data);
            data.color = '#DC7633';  // default new color (Brick)
        }
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
            cursor: isDisabled ? 'not-allowed' : 'default', ':active': {
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

export const BuildOptions = (tagsMap, entity) => {
    const tagColourOptions = []
    tagsMap.forEach((item) => {
        const tagOption = {}
        tagOption['value'] = item.id;
        tagOption['label'] = item.value;
        tagOption['color'] = item.color;
        tagColourOptions.push(tagOption);
    });

    var assigned = []
    if(entity.tags) {
        entity.tags.forEach((tag) => {
            assigned.push(tagColourOptions.find((item) => {
                return (item['value'] === tag.id)
            }))
        })
    }
    if(assigned.length === 0) {
        assigned = null;
    }

    return {tagColourOptions, assigned};
}