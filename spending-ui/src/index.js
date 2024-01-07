import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";

import App from './App';
import {StaticDataProvider} from "./contexts/static_data.context";
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";
import {BrowserRouter} from "react-router-dom";
import {TemplatesProvider} from "./contexts/templates.context.jsx";
import {SavedFiltersProvider} from "./contexts/saved_filters_context";
import {InstitutionsProvider} from "./contexts/banks.context";
import {BatchesProvider} from "./contexts/batches.context";
import {TransactionsProvider} from "./contexts/transactions.context";
import {ProcessedBatchesProvider} from "./contexts/processed_batches.context";
import {ProcessedTransactionsProvider} from "./contexts/processed_transactions.context";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <StaticDataProvider>
              <BatchesProvider>
                  <ProcessedBatchesProvider>
                      <ProcessedTransactionsProvider>
                          <TagsProvider>
                              <TransactionsProvider>
                                  <CategoriesProvider>
                                      <TemplatesProvider>
                                          <SavedFiltersProvider>
                                              <InstitutionsProvider>
                                                <App />
                                              </InstitutionsProvider>
                                          </SavedFiltersProvider>
                                      </TemplatesProvider>
                                  </CategoriesProvider>
                              </TransactionsProvider>
                          </TagsProvider>
                      </ProcessedTransactionsProvider>
                  </ProcessedBatchesProvider>
              </BatchesProvider>
          </StaticDataProvider>
      </BrowserRouter>
  </React.StrictMode>
);
