import React from "react";
import {useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import {Row, Col} from "react-bootstrap";

import FormInput from "../form-input/form-input.component";
import Button from "../button/button-component";
import reactCSS from 'reactcss'

import {SwatchesPicker} from 'react-color';

import jslogger from '../../utils/jslogger.js';
jslogger.setLevelToVerbose(false);
jslogger.setUseTimestamp(false);

const TagFormComponent = () => {
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [newEntry, setNewEntry] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [newColor, setNewColor] = useState("#888888");

    const resetFormFields = () => {
        setNewEntry("");
        setNewNotes("");
        setNewColor("white");
    }

    // ------------------- Color Picker Support -----------------------
    const handleColorChange = async (color) => {
        jslogger.debug('tags-table', "ColorChange")
    };

    const handleColorClick = () => {
        jslogger.debug('tags-table', "ColorClick")
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClose = (color) => {
        jslogger.debug('tags-table', "ColorClose")
        setShowColorPicker(false);
    }

    const handleColorChangeComplete = (color, event) => {
        jslogger.debug('tags-table', "ColorComplete")
        setNewColor(color.hex);
        setShowColorPicker(false);
    }

    const styles = reactCSS({
        'default': {
            color: {
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `${newColor}`,
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

    // -------------------------- Event handlers for New Tag ----------------------------

    function handleChange(event) {
        const {name, value} = event.target;
        if (name === 'newEntry') {
            setNewEntry(value);
        } else if (name === 'newNotes') {
            setNewNotes(value);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();  // don't have form clear screen
        jslogger.debug('tags-table', "handleSubmit: ", event);
        jslogger.debug('tags-table', "Adding new entry: ", newEntry);

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "value": newEntry,
                "notes": newNotes,
                "color": newColor
            })
        };

        const url = 'http://localhost:8000/resources/tags';
        const response = await fetch(url, requestOptions);
        const str = await response.json();
        jslogger.debug('tags-table', "Response: ", str);
        resetFormFields();
    }

    // --------------------------- Render ----------------------------------------
    jslogger.debug('tags-table', "Render");
    return (
        <div>
            <Row>
                <form onSubmit={handleSubmit}>
                    <Col>
                        <FormInput
                            label='New Value'
                            type='text'
                            required
                            onChange={handleChange}
                            name="newEntry"
                            value={newEntry}
                        />
                    </Col>
                    <Col>
                        <FormInput
                            label='Notes'
                            type='text'
                            required
                            onChange={handleChange}
                            name="newNotes"
                            value={newNotes}
                        />
                    </Col>
                    <Col>
                        <label>Display Color</label>
                        <div style={styles.swatch} onClick={handleColorClick}>
                            <div style={styles.color}/>
                        </div>
                        <div style={styles.popover}>
                            {
                                showColorPicker &&
                                <div>
                                    <div style={styles.cover} onClick={handleColorClose}/>
                                    <label>Color</label>
                                    <SwatchesPicker
                                        disableAlpha={true}
                                        color={newColor}
                                        onChangeComplete={handleColorChangeComplete}
                                        onChange={handleColorChange}/>
                                </div>
                            }
                        </div>
                    </Col>
                    <Row>
                        <Button type='submit' id='signup submit'>Add</Button>
                    </Row>
                </form>
            </Row>
        </div>
    )
}

export default TagFormComponent;
