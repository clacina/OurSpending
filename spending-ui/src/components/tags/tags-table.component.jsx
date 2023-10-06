import React from "react";
import {useContext, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import cellEditFactory from "react-bootstrap-table2-editor";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TableBaseComponent from '../table-base/table-base.component.jsx';

import reactCSS from 'reactcss'
import {SwatchesPicker} from 'react-color';

import jsLogger from '../../utils/jslogger.js';

const TagsTableComponent = () => {
    const {tagsMap, setTagsMap} = useContext(TagsContext);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedTag, setSelectedTag] = useState();

    const log = (...args) => {
        jsLogger.info('tag-table', args);
    }
    
    // -------------------- Event handlers for Tag Edit ---------------------
    const cellEdit = cellEditFactory({
        mode: 'click',
        afterSaveCell: async (oldValue, newValue, row, column) => {
            const requestOptions = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "value": row.value,
                    "notes": row.notes ? row.notes : '',
                    "color": row.color
                })
            };
            const url = 'http://localhost:8000/resources/tags/' + row.id;
            const response = await fetch(url, requestOptions);
            const str = await response.json();
            log('tags-table', "Response: ", str);
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

        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": updatedTag.value,
                "notes": updatedTag.notes ? updatedTag.notes : "",
                "color": color.hex
            })
        };
        const url = 'http://localhost:8000/resources/tags/' + selectedTag;
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        log("Response: ", str);
        setTagsMap(newMap);
    };

    const handleColorClick = () => {
        log("ColorClick")
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClose = (color) => {
        log("ColorClose")
        setShowColorPicker(false);
        setSelectedTag(null);
    }

    const handleColorChangeComplete = (color, event) => {
        log("ColorComplete")
        setShowColorPicker(false);
    }

    // Setup tags column as a multi-select
    const tagColumnFormatter = (cell, row, rowIndex, formatExtraData) => {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '36px',
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
            log('tags-table', "Setting selected tag: ", row.id);
            setSelectedTag(row.id);
        }

        if(showColorPicker) {
            e.stopPropagation();
        }
    }

    // Create column definitions for display table
    const columns = [];
    columns.push({dataField: 'id', text: 'Id', sort: true})
    columns.push({dataField: 'value', text: 'Value', sort: true})
    columns.push({dataField: 'notes', text: 'Note', sort: false})
    columns.push({
        dataField: 'color',
        editable: false,
        // isDummyField: true,
        text: 'Display Color',
        formatter: tagColumnFormatter,
        events: {
            onClick: colEvent
        },
    })

    // --------------------------- Render ----------------------------------------
    log("Render");
    return (
        <Row>
            <TableBaseComponent
                columns={columns}
                data={tagsMap}
                keyField='id'
                cellEdit={cellEdit}
            />
        </Row>
    )
}

export default TagsTableComponent;
