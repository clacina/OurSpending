import React from "react";
import "react-contexify/dist/ReactContexify.css";
import { Row } from "react-bootstrap";

import TagFormComponent from "./tag-form.component.jsx";
import TagsTableComponent from "./tags-table.component.jsx";


const TagsComponent = () => {
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
