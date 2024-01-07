
import moment from "moment";
import React, {useContext, useRef, useState} from "react";
import {InputActionMeta} from "react-select";
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import {StaticDataContext} from "../../contexts/static_data.context.jsx";
import {SavedFiltersContext} from "../../contexts/saved_filters_context";
import TagSelector from "../widgets/tag-selector/tag-selector.component.jsx";
import './header.component.styles.css';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "react-bootstrap/Button";
import Collapsible from "react-collapsible";
import ModalPromptComponent from "../widgets/modal-prompt/modal-prompt.component";


const HeaderComponent = ({eventHandler}) => {
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {institutions} = useContext(StaticDataContext);
    const {filtersMap} = useContext(SavedFiltersContext);
    const [searchText, setSearchText] = useState("") ;
    const [startDateFilter, setStartDateFilter] = useState();
    const [endDateFilter, setEndDateFilter] = useState();
    const [clearTags, setClearTags] = useState(false);
    const [matchAllTags, setMatchAllTags] = useState(false);
    const [currentFilterName, setCurrentFilterName] = useState("No Filter Loaded");
    const [openSaveDialog, setOpenSaveDialog] = useState(false);

    const categorySelectionRef = useRef();
    const institutionSelectionRef = useRef();
    const savedFilterSelectionRef = useRef();

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

        eventHandler({'startDate': null});
        eventHandler({'endDate': null});
    }

    const printContent = () => {
        eventHandler('printContent');
    }

    const saveFilter = () => {
        setOpenSaveDialog(true);
    }

    const loadFilter = () => {
        console.log("Saved Filters: ", filtersMap);
        eventHandler('loadFilter');
    }

    const closeModal = async (id, value, save_result) => {
        if (openSaveDialog) {
            setOpenSaveDialog(false);
            if(save_result) {
                console.log("Saving filters as: ", value);
                eventHandler('saveFilter');
                // await updateNotes(id, value);
            }
        }
    }

    return(
        <div id='filterPanel'>
            <Collapsible trigger='Display and Filter Options'>
                <div className='filter'>
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
                            <Button onClick={printContent} id='printContentButton' className="mb-md-1">Print Result</Button>
                        </div>
                    </div>
                    <div id='filterHeaderRight'>
                        <h5>Saved Filters</h5>
                        <Button onClick={saveFilter} id='saveFilterButton' className="mb-md-1">Save Filter</Button>
                        <p>{currentFilterName}</p>
                        <select
                            id="savedFilterSelection"
                            ref={savedFilterSelectionRef}
                            onChange={loadFilter}
                            multiple={true}
                        >
                            {filtersMap.map((item) => {
                                return(<option>{item.name}</option>)
                            })}
                        </select>
                    </div>
                    {
                        openSaveDialog && <ModalPromptComponent
                            closeHandler={closeModal}
                            title="Save Current Filter Settings"/>
                    }
                </div>

            </Collapsible>
        </div>
    )
}

export default HeaderComponent;
