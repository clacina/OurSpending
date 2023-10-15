
import React, {useContext, useState} from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TagSelectorComponent from "../tag-selector/tag-selector.component.jsx";
import './header.component.styles.css';

/*
    const [filterParams, setFilterParams] = useState({
        'hideUncategorized': false,
        'useDateRange': false,
        'useTags': false,
        'useCategories': false,
        'useInstitutions': false
    });

    const [displayParams, setDisplayParams] = useState({
        'templateView': true,
        'categoryView': false,
    });

    const [useGrouping, setUseGrouping] = useState(false);
    const [categorized, setCategorized]= useState(true);

    {useGrouping && <p>Grouped by Category</p>}
    {useGrouping && categorized && <p>Show All</p>}
    {useGrouping && !categorized && <p>List Uncategorized</p>}
    {!useGrouping && <p>Grouped by Bank</p>}

*/

const HeaderComponent = () => {
    const [templateView, setTemplateView] = useState(true);
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const [searchText, setSearchText] = useState("") ;

    const handleSelect = (eventKey) => {
        alert(`selected ${eventKey}`);
        switch (eventKey) {
            case 'templateView':
                setTemplateView(!templateView);
                break;
            case 'categoryView':
                break;
            case 'hideUncategorized':
                break;
            case 'useTagFilter':
                break;
            case 'useCategoryFilter':
                break;
            case 'useInstitutionFilter':
                break;
            default: console.log("Unknown eventKey: ", eventKey);
        }
    }
    const transaction = {
        "tags": []
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        console.log("Tags for: ", transaction_id);
        console.log("        : ", tag_list);
    }

    // Format list
    const options = []
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    const updateCategory = (event) => {
        event.forEach((item) => {
            console.log("Cat: ", item.value);
        });
    }

    // Sort comparator
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    function compareTags(a, b) {
        return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
    }

    const onSearch = (event) => {
        console.log("Search for: ", searchText);
    }

    const onChangeSearch = (event) => {
        setSearchText(event.target.value);
    }

    const changeView = (event) => {
        console.log(event);
    }

    return(
        <div>
            <Navbar expand="xxl"
                    expanded={true}
                    className="bg-body-tertiary">
                    <Navbar.Brand>Display and Filter Options</Navbar.Brand>
                    <Nav justify={false}
                         // className="me-auto"
                         justify-content="space-between"
                         activeKey="1"
                         onSelect={handleSelect}>
                        <Nav.Link eventKey="1">Group by Template</Nav.Link>
                        <Nav.Link eventKey="2">Group by Category</Nav.Link>
                        <Nav.Link as={TagSelectorComponent}
                                  id="tagSelection"
                                  tagsMap={tagsMap.sort(compareTags)}
                                  transaction={transaction}
                                  onChange={changeTag} />
                        <Nav.Link as={Select}
                                  id="categorySelection"
                                  closeMenuOnSelect={true}
                                  options={options.sort(compareCategories)}
                                  isMulti
                                  menuPortalTarget={document.body}
                                  menuPosition={'fixed'}
                                  onChange={updateCategory}/>
                        <input id="search-input" type="text" onChange={onChangeSearch}/>
                        <button onClick={onSearch} value={searchText}>Search</button>
                    </Nav>
            </Navbar>
        </div>
    )
}

export default HeaderComponent;
