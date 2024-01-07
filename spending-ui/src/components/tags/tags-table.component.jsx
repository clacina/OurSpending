import React from "react";
import {useContext, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import cellEditFactory from "react-bootstrap-table2-editor";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TableBaseComponent from '../widgets/table-base/table-base.component.jsx';

import reactCSS from 'reactcss'
import {SwatchesPicker} from 'react-color';

const TagsTableComponent = () => {
    const {tagsMap, setTagsMap, updateTag} = useContext(TagsContext);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedTag, setSelectedTag] = useState();

    // -------------------- Event handlers for Tag Edit ---------------------
    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: async (oldValue, newValue, row, column) => {
            updateTag(row.id, row.value, row.notes, row.color);
        }
    })

    // ------------------- Color Picker Support -----------------------
    const handleColorChange = async (color) => {
        const newMap = tagsMap.map((item) => {
            return (item.id === selectedTag ? {...item, color: color.hex} : item)
        })

        const updatedTag = tagsMap.find((item) => {
            return (item.id === selectedTag);
        });

        updateTag(selectedTag, updatedTag.value, updatedTag.notes, color.hex);
        setTagsMap(newMap);
    };

    const handleColorClick = () => {
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClose = (color) => {
        setShowColorPicker(false);
        setSelectedTag(null);
    }

    const handleColorChangeComplete = (color, event) => {
        setShowColorPicker(false);
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '150px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `${ row.color }`,
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={ styles.swatch } onClick={ handleColorClick }>
                    <div style={ styles.color } />
                </div>
                { showColorPicker && row.id === selectedTag &&
                    <div style={ styles.popover }>
                        <div style={ styles.cover } onClick={ handleColorClose }/>
                        <SwatchesPicker
                            disableAlpha={true}
                            color={ row.color }
                            onChangeComplete={handleColorChangeComplete}
                            onChange={ handleColorChange } />
                    </div>
                }
            </div>
        );
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        if (columnIndex === 3) {  // tags column - it's a drop down
            e.stopPropagation();
            setSelectedTag(row.id);
        }

        if(showColorPicker) {
            e.stopPropagation();
        }
    }

    // Create column definitions for display table
    const headerBackgroundColor = '#008080'
    const columns = [];
    columns.push({dataField: 'id', text: 'Id',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'100px',
        },
        sort: true})
    columns.push({dataField: 'value', text: 'Value',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        sort: true})
    columns.push({dataField: 'notes', text: 'Notes',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        sort: false})
    columns.push({
        dataField: 'color',
        editable: false,
        // isDummyField: true,
        text: 'Display Color',
        headerStyle: {
            backgroundColor: headerBackgroundColor,
            color: 'white'
        },
        headerAttrs: {
            width:'200px',
        },
        formatter: tagColumnFormatter,
        events: {
            onClick: colEvent
        },
    })

    // --------------------------- Render ----------------------------------------
    return (
        <TableBaseComponent
            columns={columns}
            data={tagsMap}
            keyField='id'
            cellEdit={cellEdit}
        />
    )
}

export default TagsTableComponent;
