import './App.css';
import {Route, Routes} from "react-router-dom";
import {Fragment} from "react";

import MenuBar from "./routes/navigation/navigation.component";
import BanksComponent from "./components/banks/banks.component";
import BatchesComponent from "./components/batches/batches.component";
import CategoriesComponent from "./components/categories/categories.component";
import Faire from "./components/faire/faire.component";
import Home from "./routes/home/home.component";
import ProcessedBatches from "./components/processed-batches/processed-batches.component";
import ProcessedTransactions from "./components/processed-transactions/processed-transactions.component";
import Reports from "./components/reports/reports.component";
import TagsComponent from "./components/tags/tags.component";
import TemplateList from "./components/templates/template-list.component";
import TransactionsList from "./components/transaction/transactions-list.component";
import CreditCards from "./components/credit-cards/credit.card.component";
import Events from "./components/events/events.component";

// Setup Logger
// import jsLogger from './utils/jslogger.js';
// jsLogger.setLevelToVerbose(false);
// jsLogger.setUseTimestamp(false);

function App() {

    const PageNotFound = () => {
        return(
            <div>
                <h2>404 Page Not Found</h2>
            </div>
        )
    }
    return (
        <Fragment>
            <MenuBar/>
            <Routes>
                <Route index element={<Home/>}/>
                <Route path='categories/*' element={<CategoriesComponent/>}/>
                <Route path='tags/*' element={<TagsComponent/>}/>
                <Route path='banks/*' element={<BanksComponent/>}/>
                <Route path='templates/*' element={<TemplateList/>}/>
                <Route path='batches/*' element={<BatchesComponent/>}/>
                <Route path='transactions/:batch_id' element={<TransactionsList/>}/>
                <Route path='processed_batches/*' element={<ProcessedBatches/>}/>
                <Route path='processed_transactions/:batch_id' element={<ProcessedTransactions/>}/>
                <Route path='reports/*' element={<Reports/>}/>
                <Route path='cards/*' element={<CreditCards/>}/>
                <Route path='faire/*' element={<Faire/>}/>
                <Route path='events/*' element={<Events/>}/>
                <Route path='*' element={<PageNotFound />}/>
            </Routes>
        </Fragment>
    );
}

export default App;
