import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import "bootstrap/dist/css/bootstrap.min.css";

import AdminApp from './App';
import {StaticDataProvider} from "../../contexts/static_data.context";
import {CategoriesProvider} from "../../contexts/categories.context";
import {TagsProvider} from "../../contexts/tags.context";
import {BrowserRouter} from "react-router-dom";
import {TemplatesProvider} from "../../contexts/templates.context.jsx";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "../../dev";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <StaticDataProvider>
                <CategoriesProvider>
                    <TagsProvider>
                        <TemplatesProvider>
                            <DevSupport ComponentPreviews={ComponentPreviews}
                                        useInitialHook={useInitial}
                            >
                                <AdminApp/>
                            </DevSupport>
                        </TemplatesProvider>
                    </TagsProvider>
                </CategoriesProvider>
            </StaticDataProvider>
        </BrowserRouter>
    </React.StrictMode>
);
