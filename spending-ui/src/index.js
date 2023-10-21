import {combineReducers, createStore} from "@reduxjs/toolkit";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";

import App from './App';
// import store from './app/store.js';
import { tagsSlice, fetchTags } from './features/tagsSlice.js';
import {connect, Provider, useDispatch, useSelector} from 'react-redux'

import {StaticDataProvider} from "./contexts/static_data.context";
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";
import {BrowserRouter} from "react-router-dom";
import {TemplatesProvider} from "./contexts/templates.context.jsx";

const root = ReactDOM.createRoot(document.getElementById('root'));

const reducer = combineReducers({
    tagsMap: tagsSlice.reducer
})

const store = createStore(reducer)

store.dispatch(fetchTags());


function mapStateToProps(state) {
    const {tagsMap} = state;
    return(tagsMap: tagsMap.tagsMap);
}

const Container = connect(mapStateToProps, { login, logout })(Main);


// function App() {
//     return (
//         <Provider store={store}>
//             <Container/>
//         </Provider>
//     );
// }


root.render(
  <React.StrictMode>
      <BrowserRouter>
          <Provider store={store}>
              <Container>
                  <StaticDataProvider>
                      <CategoriesProvider>
                          <TagsProvider>
                              <TemplatesProvider>
                                <App />
                              </TemplatesProvider>
                          </TagsProvider>
                      </CategoriesProvider>
                  </StaticDataProvider>
              </Container>
          </Provider>
      </BrowserRouter>
  </React.StrictMode>
);
