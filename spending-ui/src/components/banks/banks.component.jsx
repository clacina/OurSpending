import React from "react";
import {useContext, useEffect, useState} from "react";

import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import TableBaseComponent from '../table-base/table-base.component.jsx';
import {StaticDataContext} from "../../contexts/static_data.context";
import ModalPromptComponent from "../modal-prompt/modal-prompt.component";
import send from "../../utils/http_client";
import {InstitutionsContext} from "../../contexts/banks.context";
import './banks.component.styles.css';

const BanksComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const {institutionsMap, setUpdate} = useContext(InstitutionsContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeRow, setActiveRow] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);
    const [editColumn, setEditColumn] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editPrompt, setEditPrompt] = useState("text")
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        console.log("Start");
        if (institutionsMap.length !== 0) {
            setSectionTitle('Banks');
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [institutionsMap]);

    const callUpdate = async (bank_id, body) => {
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/bank/' + bank_id;
        const method = 'PUT'
        console.log("Sending update: ", body);
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
        setUpdate(true);
    }

    const updateKey = async (bank_id, value) => {
        const body = {
            'name': activeRow.name,
            'key': value,
            'notes': activeRow.notes
        }
        await callUpdate(bank_id, body);
    }

    const updateNotes = async (bank_id, note) => {
        const body = {
            'name': activeRow.name,
            'key': activeRow.key,
            'notes': note
        }
        await callUpdate(bank_id, body);
    }

    const updateName = async (bank_id, value) => {
        const body = {
            'name': value,
            'key': activeRow.key,
            'notes': activeRow.notes,
        }
        await callUpdate(bank_id, body);
    }
    const closeModal = async (id, value, save_result) => {
        if (openNotes) {
            console.log("Close Modal: ", value);
            setOpenNotes(false);
            if(save_result) {
                console.log("---Saving: ", editColumn);
                switch(editColumn) {
                    case 1: // Key
                        if(value.length === 0) {
                            alert("Cannot set the Key to an empty string.");
                            return;
                        }
                        await updateKey(id, value);
                        break;
                    case 2: // Name
                        if(value.length === 0) {
                            alert("Cannot set the Name to an empty string.");
                            return;
                        }
                        await updateName(id, value);
                        break;
                    case 3: // notes
                        await updateNotes(id, value);
                        break;
                    default: break;
                }
            }
        }
    }

    const colEvent = (e, column, columnIndex, row, rowIndex) => {
        setActiveRow(row);
        console.log("Click col: ", columnIndex);
        console.log("Click row: ", rowIndex);
        console.log("Row: ", row);
        switch (columnIndex) {
            case 1: // Key
                console.log("Edit hint: ", row.notes);
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(1);
                setEditTitle("Bank Key");
                setEditPrompt("text");
                setEditContent(row.key);
                setOpenNotes(true);
                break;
            case 2: // Name
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(2);
                setEditPrompt("text");
                setEditTitle("Bank Name");
                setEditContent(row.name);
                setOpenNotes(true);
                break;
            case 3: // notes
                e.preventDefault();
                e.stopPropagation();
                setEditColumn(3);
                setEditPrompt("text");
                setEditTitle("Bank Note");
                setEditContent(row.notes);
                setOpenNotes(true);
                break;
            default:
                break
        }
    }

    if(isLoaded) {
        const columns = [];
        columns.push({dataField: 'id', text: 'Id', sort: true})
        columns.push({dataField: 'key', text: 'Key', sort: true, events: {
                onClick: colEvent
            }, style: {cursor: 'pointer'}})
        columns.push({dataField: 'name', text: 'Name', sort: true, events: {
                onClick: colEvent
            }, style: {cursor: 'pointer'}})
        columns.push({dataField: 'notes', text: 'Notes', sort: true, events: {
                onClick: colEvent
            }, style: {cursor: 'pointer'}})

        return (
            <div id='banks_container'>
                <TableBaseComponent columns={columns} data={institutionsMap} keyField='id'/>
                {
                    openNotes && activeRow && <ModalPromptComponent
                        closeHandler={closeModal}
                        content={editContent}
                        title={editTitle}
                        prompt_type={editPrompt}
                        entity_id={activeRow.id}/>
                }
            </div>
        )
    }
}

export default BanksComponent;
