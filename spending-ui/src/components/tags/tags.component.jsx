import React, {useContext, useEffect} from "react";
import "react-contexify/dist/ReactContexify.css";
import {StaticDataContext} from "../../contexts/static_data.context";

import './tags.component.styles.css';
import TagFormComponent from "./tag-form.component.jsx";
import TagsTableComponent from "./tags-table.component.jsx";


const TagsComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    setSectionTitle('Tags');

    return (
        <div id='tagsPageContainer'>
            <TagFormComponent/>
            <hr/>
            <p>Click any column to edit that value.</p>
            <TagsTableComponent />
        </div>
    )
}

export default TagsComponent;
