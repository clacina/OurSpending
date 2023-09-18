import './App.css';
import {Route, Routes} from "react-router-dom";

import {institutionData} from './assets/data/banks.jsx';
import {templates} from './assets/data/templates.jsx';
import {transactions} from "./assets/data/transactions.jsx";

import Navbar from "./routes/navigation/navigation.component";
import Home from "./routes/home/home.component";
import {Fragment} from "react";
import TemplateList from "./components/template-list/template-list.component";
import TransactionsList from "./components/transactions-list/transactions-list.component";
import ProcessedTransactions from "./components/processed-transactions/processed-transactions.component";
import BanksComponent from "./components/banks/banks.component";
import ProcessedBatches from "./components/processed-batches/processed-batches.component";
import TagsComponent from "./components/tags/tags.component";
import CategoriesComponent from "./components/categories/categories.component";
import BatchesComponent from "./components/batches/batches.component";

function App() {
    return (
        <Fragment>
            <Navbar/>
            <Routes>
                <Route index element={<Home/>}/>
                <Route path='categories/*' element={<CategoriesComponent/>}/>
                <Route path='tags/*' element={<TagsComponent/>}/>
                <Route path='banks/*' element={<BanksComponent banks={institutionData}/>}/>
                <Route path='templates/*' element={<TemplateList templates={templates}/>}/>
                <Route path='batches/*' element={<BatchesComponent/>}/>
                <Route path='transactions/*' element={<TransactionsList transactions={transactions}/>}/>
                <Route path='processed_batches/*' element={<ProcessedBatches/>}/>
                <Route path='processed_transactions/*' element={<ProcessedTransactions/>}/>
            </Routes>
        </Fragment>
    );
}

export default App;
