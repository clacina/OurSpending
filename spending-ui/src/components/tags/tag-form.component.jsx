import React, {useContext} from "react";
import {useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import Button from "react-bootstrap/Button";
import reactCSS from 'reactcss'
import {TagsContext} from "../../contexts/tags.context";
import {SwatchesPicker} from 'react-color';

const TagFormComponent = () => {
    const {addTag} = useContext(TagsContext);
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
        console.log("ColorChange")
    };

    const handleColorClick = () => {
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClose = (color) => {
        setShowColorPicker(false);
    }

    const handleColorChangeComplete = (color, event) => {
        console.log("ColorComplete")
        setNewColor(color.hex);
        setShowColorPicker(false);
    }

    const styles = reactCSS({
        'default': {
            color: {
                width: '100px',
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
        console.log("handleSubmit: ", event);
        console.log("Adding new entry: ", newEntry);
        addTag(newEntry, newNotes, newColor);
        resetFormFields();
    }

    // --------------------------- Render ----------------------------------------
    return (
        <div>
            <form id='newTagForm'>
                <label>New Tag</label>
                <input
                    type='text'
                    required
                    onChange={handleChange}
                    name="newEntry"
                    value={newEntry}
                />
                <label>Notes</label>
                <input
                    type='text'
                    required
                    onChange={handleChange}
                    name="newNotes"
                    value={newNotes}
                />
                <label>Display Color</label>
                <div id='currentColor' style={styles.swatch} onClick={handleColorClick}>
                    <div style={styles.color}/>
                </div>
                <div id='tagPopover' style={styles.popover}>
                    {
                        showColorPicker &&
                        <div>
                            <div style={styles.cover} onClick={handleColorClose}/>
                            <SwatchesPicker
                                disableAlpha={true}
                                color={newColor}
                                onChangeComplete={handleColorChangeComplete}
                                onChange={handleColorChange}/>
                        </div>
                    }
                </div>
                <Button onClick={handleSubmit}>Create New Tag</Button>
            </form>
        </div>
    )
}

export default TagFormComponent;
