import './App.css';
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";
import {StaticDataProvider} from "./contexts/static_data.context";

// import TemplateList from "./components/template-list/template-list.component";
// import {templates} from "./data";
import {transactions} from "./data";
import TransactionsList from "./components/transactions-list/transactions-list.component";

function App() {
  return (
    <div className="App">
        <StaticDataProvider>
          <CategoriesProvider>
            <TagsProvider>
              {/*<TemplateList templates={templates}/>*/}
              <TransactionsList transactions={transactions} />
            </TagsProvider>
          </CategoriesProvider>
        </StaticDataProvider>
    </div>
  );
}

export default App;
