
import moment from "moment";
import React, {useContext, useRef, useState} from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {InputActionMeta} from "react-select";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import TagSelector from "../tag-selector/tag-selector.component.jsx";
import './header.component.styles.css';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import Button from "react-bootstrap/Button";
import {ButtonGroup, ToggleButton} from "react-bootstrap";
import Collapsible from "react-collapsible";


const HeaderComponent = ({eventHandler, view, limitUncategorized}) => {
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {institutions} = useContext(StaticDataContext);
    const [searchText, setSearchText] = useState("") ;
    const [startDateFilter, setStartDateFilter] = useState();
    const [endDateFilter, setEndDateFilter] = useState();
    const [clearTags, setClearTags] = useState(false);
    const [matchAllTags, setMatchAllTags] = useState(false);

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

    function updateInstitution(event) {
        // event institutions is an array of active entries in the select
        const banks = []
        event.forEach((item) => {
            banks.push(item.value);
        });
        eventHandler({'banks': banks});
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
    }

    return(
        <div id='filterPanel'>
            <Collapsible trigger='Display and Filter Options'>
                <div className='filterHeader'>
                    <div className='searchArea'>
                        <label>Search</label>
                        <input id="search-input" value={searchText} type="text" onChange={onChangeSearch}/>
                        <Button onClick={onSearch}  className="mb-md-1">Search</Button>
                    </div>
                    <div className='tagsAndSuch'>
                        <label className='tagLabel'>Assigned Tags</label>
                        <TagSelector
                            clearEntry={clearTags}
                            tagsMap={tagsMap.sort(compareTags)}
                            canCreate={false}
                            entity={transaction}
                            selectorClass='headerTagSelector'
                            onChange={changeTag} />
                        <Form.Check
                            className='matchAll'
                            type="switch"
                            id="allTags"
                            label="Match ALL Tags"
                            checked={matchAllTags}
                            onChange={changeAllTags}
                        />
                    </div>
                    <div className='categoryFilters'>
                        <label>Categories</label>
                        <Select
                            id="categorySelection"
                            ref={categorySelectionRef}
                            closeMenuOnSelect={true}
                            options={options.sort(compareCategories)}
                            isMulti
                            onInputChange={onInputChange}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            onChange={updateCategory}/>
                        <label>Banks</label>
                        <Select
                            id="institutionSelection"
                            ref={institutionSelectionRef}
                            closeMenuOnSelect={true}
                            options={banks.sort(compareInstitutions)}
                            isMulti
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            onChange={updateInstitution}/>
                    </div>
                    <div className='dateFilters'>
                        <label className="dateLabel">Start Date</label>
                        <DatePicker
                            id="startDate"
                            selected={startDateFilter}
                            calandarClassName="rasta-stripes"
                            isClearable
                            onChange={(date)=>onChangeStartDate(date)} />
                        <label className='dateLabelEnd'>End Date</label>
                        <DatePicker
                            id="endDate"
                            selected={endDateFilter}
                            isClearable
                            onChange={(date)=>onChangeEndDate(date)} />
                        <Button onClick={clearFilters} id='clearFilterButton' className="mb-md-1">Clear Filters</Button>
                    </div>
                </div>
            </Collapsible>
        </div>
    )
}

export default HeaderComponent;

/*

                <h4>Display and Filter Options</h4>
                <div className='displayType'>
                    <input id="search-input" value={searchText} type="text" onChange={onChangeSearch}/>
                    <Button onClick={onSearch}  className="mb-md-1">Search</Button>
                </div>
                <div>
                    <TagSelector
                              clearEntry={clearTags}
                              tagsMap={tagsMap.sort(compareTags)}
                              canCreate={false}
                              entity={transaction}
                              onChange={changeTag} />
                    <Form.Check
                        type="switch"
                        id="allTags"
                        label="Match ALL Tags"
                        checked={matchAllTags}
                        onChange={changeAllTags}
                    />
                    <Select
                              id="categorySelection"
                              ref={categorySelectionRef}
                              closeMenuOnSelect={true}
                              options={options.sort(compareCategories)}
                              isMulti
                              onInputChange={onInputChange}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                              onChange={updateCategory}/>
                    <Select
                              id="institutionSelection"
                              ref={institutionSelectionRef}
                              closeMenuOnSelect={true}
                              options={banks.sort(compareInstitutions)}
                              isMulti
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                              onChange={updateInstitution}/>
                </div>
                <div>
                    <span className="dateLabel">Start Date</span>
                    <DatePicker
                              id="startDate"
                              selected={startDateFilter}
                              calandarClassName="rasta-stripes"
                              isClearable
                              onChange={(date)=>onChangeStartDate(date)} />
                    <span className='dateLabel'>End Date</span>
                    <DatePicker
                              id="endDate"
                              selected={endDateFilter}
                              isClearable
                              onChange={(date)=>onChangeEndDate(date)} />
                    <Button onClick={clearFilters}  className="mb-md-1">Clear Filters</Button>
                </div>




                    <ButtonGroup>
                    <ToggleButton  className="mb-md-1"
                        active={limitUncategorized}
                        disabled={!view}
                        id="LimitView"
                        value={3}
                        checked={limitUncategorized}
                        onClick={(e) => handleSelect('noncategoryview')}
                        type='checkbox'>Hide Categorized</ToggleButton>
                    </ButtonGroup>


 */