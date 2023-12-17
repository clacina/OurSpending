import React, {useContext} from "react";
import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";
import {StaticDataContext} from "../../contexts/static_data.context";

import TagFormComponent from "./tag-form.component.jsx";
import TagsTableComponent from "./tags-table.component.jsx";


const TagsComponent = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    setSectionTitle('Tags');
    return (
        <div>
            <Row>
                <h1>Tags</h1>
            </Row>
            <Row>
                <TagFormComponent/>
            </Row>
            <Row>
                <TagsTableComponent />
            </Row>
        </div>
    )
}

export default TagsComponent;
