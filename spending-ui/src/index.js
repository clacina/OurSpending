import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";
import App from './App';
import {StaticDataProvider} from "./contexts/static_data.context";
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";
import {BrowserRouter} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <StaticDataProvider>
              <CategoriesProvider>
                  <TagsProvider>
                      <App />
                  </TagsProvider>
              </CategoriesProvider>
          </StaticDataProvider>
      </BrowserRouter>
  </React.StrictMode>
);
