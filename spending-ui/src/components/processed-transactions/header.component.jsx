
import React, {useContext, useState} from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import TagSelectorComponent from "../tag-selector/tag-selector.component.jsx";
import './header.component.styles.css';
import Form from 'react-bootstrap/Form';


const HeaderComponent = ({eventHandler}) => {
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {institutions} = useContext(StaticDataContext);
    const [searchText, setSearchText] = useState("") ;

    // Hack for tag selector
    const transaction = {
        "tags": []
    }

    // Format categories selector
    const options = [];
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    const banks = [];
    institutions.forEach((bank) => {
        banks.push({value: bank.id, label: bank.name})
    })

    // Sort comparators
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    function compareTags(a, b) {
        return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
    }

    function compareInstitutions(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }


    // Event Handlers
    const handleSelect = (eventKey) => {
        eventHandler(eventKey);
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        eventHandler({'transaction_id': transaction_id, 'tag_list': tag_list})
    }

    const updateCategory = (event) => {
        // event contains an array of active entries in the select
        const categories = []
        event.forEach((item) => {
            categories.push(item.value);
        });
        eventHandler({'categories': categories});
    }

    const onSearch = () => {
        eventHandler({'searchString': searchText})
    }

    const onChangeSearch = (event) => {
        setSearchText(event.target.value);
    }

    const changeAllTags = () => {
        eventHandler('matchAllTags');
    }

    const changeAllCategories = () => {
        eventHandler('matchAllCategories');
    }

    function updateInstitution(event) {
        // event institutions is an array of active entries in the select
        const banks = []
        event.forEach((item) => {
            banks.push(item.value);
        });
        eventHandler({'banks': banks});
    }

    const changeAllInstitutions = () => {
        eventHandler('matchAllInstitutions');
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
                        <Nav.Link eventKey="templateview">Group by Template</Nav.Link>
                        <Nav.Link eventKey="categoryview">Group by Category</Nav.Link>
                        <Nav.Link as={TagSelectorComponent}
                                  id="tagSelection"
                                  tagsMap={tagsMap.sort(compareTags)}
                                  transaction={transaction}
                                  onChange={changeTag} />
                        <Form.Check
                            type="switch"
                            id="allTags"
                            label="Match ALL Tags"
                            onChange={changeAllTags}
                        />
                        <Nav.Link as={Select}
                                  id="categorySelection"
                                  closeMenuOnSelect={true}
                                  options={options.sort(compareCategories)}
                                  isMulti
                                  menuPortalTarget={document.body}
                                  menuPosition={'fixed'}
                                  onChange={updateCategory}/>
                        <Form.Check
                            type="switch"
                            id="allCategories"
                            label="Match ALL Categories"
                            onChange={changeAllCategories}
                        />
                        <Nav.Link as={Select}
                                  id="institutionSelection"
                                  closeMenuOnSelect={true}
                                  options={banks.sort(compareInstitutions)}
                                  isMulti
                                  menuPortalTarget={document.body}
                                  menuPosition={'fixed'}
                                  onChange={updateInstitution}/>
                        <Form.Check
                            type="switch"
                            id="allInstitutions"
                            label="Match ALL Banks"
                            onChange={changeAllInstitutions}
                        />
                        <input id="search-input" type="text" onChange={onChangeSearch}/>
                        <button onClick={onSearch} value={searchText}>Search</button>
                    </Nav>
            </Navbar>
        </div>
    )
}

export default HeaderComponent;
