
import moment from "moment";
import React, {useContext, useRef, useState} from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {InputActionMeta} from "react-select";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import TagSelectorComponent from "../tag-selector/tag-selector.component.jsx";
import './header.component.styles.css';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


const HeaderComponent = ({eventHandler}) => {
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {institutions} = useContext(StaticDataContext);
    const [searchText, setSearchText] = useState("") ;
    const [startDateFilter, setStartDateFilter] = useState();
    const [endDateFilter, setEndDateFilter] = useState();
    const [clearTags, setClearTags] = useState(false);
    const [matchAllTags, setMatchAllTags] = useState(false);
    const [matchAllCategories, setMatchAllCategories] = useState(false);
    const [matchAllInstitutins, setMatchAllInstitutions] = useState(false);

    const categorySelectionRef = useRef();
    const institutionSelectionRef = useRef();

    // Hack for tag selector
    const [transaction, setTransaction] = useState({'tags': []});

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

    const onChangeStartDate = (date) => {
        setStartDateFilter(date);
        eventHandler({'startDate': date})
    }

    const onChangeEndDate = (date) => {
        setEndDateFilter(date);
        const filterDate = moment(date);
        console.log("Filter Date: ", filterDate);
        eventHandler({'endDate': date})
    }

    const changeAllTags = () => {
        setMatchAllTags(!matchAllTags);
        eventHandler('matchAllTags');
    }

    const changeAllCategories = () => {
        setMatchAllCategories(!matchAllCategories);
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
        setMatchAllInstitutions(!matchAllInstitutins);
        eventHandler('matchAllInstitutions');
    }

    const onInputChange = (inputValue: string, {action, prevInputValue}: InputActionMeta) => {
        console.log("action: ", action);
    }

    const clearFilters = () => {
        console.log("Clear Filters");
        setSearchText("") ;
        setStartDateFilter(null);
        setEndDateFilter(null);
        setTransaction({'tags': []});
        setClearTags(!clearTags);
        categorySelectionRef.current.clearValue();
        institutionSelectionRef.current.clearValue();
        setMatchAllTags(false);
        setMatchAllCategories(false);
        setMatchAllInstitutions(false);
    }

    return(
        <div>
            <Navbar expand="xxl" expanded={true} className="bg-body-tertiary">
                <Navbar.Brand>Display and Filter Options</Navbar.Brand>
                <Nav justify={false}
                     className="me-auto"
                     justify-content="space-between"
                     activeKey="1"
                     onSelect={handleSelect}>
                    <Nav.Link eventKey="templateview">Group by Template</Nav.Link>
                    <Nav.Link eventKey="categoryview">Group by Category</Nav.Link>
                    <input id="search-input" value={searchText} type="text" onChange={onChangeSearch}/>
                    <button onClick={onSearch} >Search</button>
                </Nav>
            </Navbar>
            <Navbar expand="xxl" expanded={true} className="bg-body-tertiary">
                <Nav justify={false} className="me-auto" justify-content="space-between">
                    <Nav      as={TagSelectorComponent}
                              clearEntry={clearTags}
                              tagsMap={tagsMap.sort(compareTags)}
                              transaction={transaction}
                              onChange={changeTag} />
                    <Form.Check
                        type="switch"
                        id="allTags"
                        label="Match ALL Tags"
                        checked={matchAllTags}
                        onChange={changeAllTags}
                    />
                    <Nav.Link as={Select}
                              id="categorySelection"
                              ref={categorySelectionRef}
                              closeMenuOnSelect={true}
                              options={options.sort(compareCategories)}
                              isMulti
                              onInputChange={onInputChange}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                              onChange={updateCategory}/>
                    <Form.Check
                        type="switch"
                        id="allCategories"
                        label="Match ALL Categories"
                        checked={matchAllCategories}
                        onChange={changeAllCategories}
                    />
                    <Nav.Link as={Select}
                              id="institutionSelection"
                              ref={institutionSelectionRef}
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
                        checked={matchAllInstitutins}
                        onChange={changeAllInstitutions}
                    />
                </Nav>
            </Navbar>
            <Navbar expand="xxl" expanded={true} className="bg-body-tertiary">
                <Nav justify={false} className="me-auto" justify-content="space-between">
                    <span className="dateLabel">Start Date</span>
                    <Nav.Link as={DatePicker}
                              id="startDate"
                              selected={startDateFilter}
                              calandarClassName="rasta-stripes"
                              isClearable
                              onChange={(date)=>onChangeStartDate(date)} />
                    <span className='dateLabel'>End Date</span>
                    <Nav.Link as={DatePicker}
                              id="endDate"
                              selected={endDateFilter}
                              isClearable
                              onChange={(date)=>onChangeEndDate(date)} />
                    <button onClick={clearFilters} >Clear Filters</button>
                </Nav>
            </Navbar>
        </div>
    )
}

export default HeaderComponent;

/**********************************
export const componentB = () => {
    return (
        <Select />
    );
}

const changeComponentB = () => {
    ?? How do I get component b and operate on the properties of the Select
}

export const main = () => {
    return(
        <div>
            <button onClick={changeComponentB}/>
            <componentA>
                <componentB />
            </componentA>
        </div>
    );
}



**********************************/
