import './App.css';
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";

import TemplateList from "./components/template-list/template-list.component";
import {templates} from "./data";
import {transactions} from "./data";

function App() {
  return (
    <div className="App">
      <CategoriesProvider>
        <TagsProvider>
          <TemplateList templates={templates}/>
        </TagsProvider>
      </CategoriesProvider>
    </div>
  );
}

export default App;
