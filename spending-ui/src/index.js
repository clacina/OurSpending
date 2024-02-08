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
import {BatchContentsProvider} from "./contexts/batch_contents.context";
import {QualifiersProvider} from "./contexts/qualifiers.context";
import {ActionsProvider} from "./contexts/actions.context";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <StaticDataProvider>
              <ActionsProvider>
                  <BatchesProvider>
                      <ProcessedBatchesProvider>
                          <ProcessedTransactionsProvider>
                              <TagsProvider>
                                  <TransactionsProvider>
                                      <QualifiersProvider>
                                          <CategoriesProvider>
                                              <TemplatesProvider>
                                                  <SavedFiltersProvider>
                                                      <InstitutionsProvider>
                                                          <BatchContentsProvider>
                                                              <App />
                                                          </BatchContentsProvider>
                                                      </InstitutionsProvider>
                                                  </SavedFiltersProvider>
                                              </TemplatesProvider>
                                          </CategoriesProvider>
                                      </QualifiersProvider>
                                  </TransactionsProvider>
                              </TagsProvider>
                          </ProcessedTransactionsProvider>
                      </ProcessedBatchesProvider>
                  </BatchesProvider>
              </ActionsProvider>
          </StaticDataProvider>
      </BrowserRouter>
  </React.StrictMode>
);
