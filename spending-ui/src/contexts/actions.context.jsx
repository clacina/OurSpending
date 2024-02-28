import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const ActionsContext = createContext({
    actions: [],
    setActions: () => null,
});

export const ActionsProvider = ({children}) => {
    const processBatch = async (batch_id, notes) => {
        console.log("In process batch...");
        const headers = {'Content-Type': 'application/json'}
        const url = `${process.env.REACT_APP_PROCESSOR}` + '/actions/batch/' + batch_id + '/process';
        const method = 'POST'
        const body = {
            "notes": notes
        }
        console.log("Sending update: ", body);
        const request = await send(url, method, headers, body);
        console.log("Response: ", request);
    }

    const value = {processBatch};
    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
};
