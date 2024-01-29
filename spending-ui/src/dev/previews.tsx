import React from "react";
import {ComponentPreview, Previews} from "@react-buddy/ide-toolbox";
import {PaletteTree} from "./palette";
import CreateTemplateDialogComponent from "../components/widgets/create-template-dialog/create.template.component";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/CreateTemplateDialogComponent">
                <CreateTemplateDialogComponent/>
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;