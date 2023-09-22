import './App.css';
import {Route, Routes} from "react-router-dom";
import {Fragment} from "react";

import Navbar from "./routes/navigation/navigation.component";
import BanksComponent from "./components/banks/banks.component";
import BatchesComponent from "./components/batches/batches.component";
import CategoriesComponent from "./components/categories/categories.component";
import Home from "./routes/home/home.component";
import ProcessedBatches from "./components/processed-batches/processed-batches.component";
import ProcessedTransactions from "./components/processed-transactions/processed-transactions.component";
import TagsComponent from "./components/tags/tags.component";
import TemplateList from "./components/template-list/template-list.component";
import TransactionsList from "./components/transactions-list/transactions-list.component";

function App() {
    return (
        <Fragment>
            <Navbar/>
            <Routes>
                <Route index element={<Home/>}/>
                <Route path='categories/*' element={<CategoriesComponent/>}/>
                <Route path='tags/*' element={<TagsComponent/>}/>
                <Route path='banks/*' element={<BanksComponent/>}/>
                <Route path='templates/*' element={<TemplateList/>}/>
                <Route path='batches/*' element={<BatchesComponent/>}/>
                <Route path='transactions/*' element={<TransactionsList/>}/>
                <Route path='processed_batches/*' element={<ProcessedBatches/>}/>
                <Route path='processed_transactions/*' element={<ProcessedTransactions/>}/>
            </Routes>
        </Fragment>
    );
}

export default App;
