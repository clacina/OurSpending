import './App.css';
import {CategoriesProvider} from "./contexts/categories.context";
import {TagsProvider} from "./contexts/tags.context";

import TemplateList from "./components/template-list/template-list.component";

const templates = [
  {
    "id": 20,
    "credit": false,
    "hint": "Loan Payment",
    "notes": "",
    "category": {
      "id": 14,
      "value": "Loan"
    },
    "institution": {
      "id": 1,
      "key": "WLS_CHK",
      "name": "Wellsfargo Checking"
    },
    "tags": [
      {
        "id": 4,
        "value": "Recurring"
      },
      {
        "id": 7,
        "value": "Loan"
      }
    ],
    "qualifiers": [
      {
        "id": 83,
        "value": "ONLINE TRANSFER REF ",
        "institution_id": 1
      },
      {
        "id": 84,
        "value": " TO INSTALLMENT LOANS XXXXXX49130001",
        "institution_id": 1
      }
    ]
  }
];

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
