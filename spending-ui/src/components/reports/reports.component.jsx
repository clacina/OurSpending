import React, {useContext, useEffect, useRef, useState} from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import {CategoriesContext} from "../../contexts/categories.context";
import {StaticDataContext} from "../../contexts/static_data.context";
import {TagsContext} from "../../contexts/tags.context";
import moment from "moment/moment";

import {
    ChartColumn,
    FilterColumn,
    ReportRow,
    FilterRow,
    FilterSelect
} from './reports.component.styles';

import TagSelector from "../tag-selector/tag-selector.component";
import './reports.component.styles.css';
import DatePicker from "react-datepicker";
import {
    lookupTemplateCategory,
    monthCodes,
    sumTransactions,
    colorCodes,
    getTransactions,
    sortTransactionsIntoMonths,
    compareLabels,
    compareValues
} from './report.utils.jsx';


const Reports = () => {
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);
    const [legendData, setLegendData] = useState([]);

    // Filter Flags
    const [tagsFilter, setTagsFilter] = useState([]);
    const [categoriesFilter, setCategoriesFilter] = useState([]);
    const [clearTags, setClearTags] = useState(false);
    const [matchAllTags, setMatchAllTags] = useState(false);
    const [institutionFilter, setInstitutionFilter] = useState([]);
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);

    // Lookup Tables
    const {templatesMap} = useContext(TemplatesContext);
    const {categoriesMap} = useContext(CategoriesContext);
    const {institutions} = useContext(StaticDataContext);
    const {tagsMap} = useContext(TagsContext);

    const categorySelectionRef = useRef();
    const institutionSelectionRef = useRef();

    // Format categories selector
    const options = [];
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    const banks = [];
    institutions.forEach((bank) => {
        banks.push({value: bank.id, label: bank.name})
    })

    // Hack for tag selector
    const [tagSelectorHack, setTagSelectorHack] = useState({id:0, tags: []});

    // ------------------------------------------------------------------------------------
    // Event Handlers
    const eventHandler = (event) => {
        console.log("Event: ", event);
        if (event.hasOwnProperty('tag_list')) {
            console.log("--Setting Tags Filter")
            setTagsFilter(event['tag_list']);
        } else if (event.hasOwnProperty('categories')) {
            console.log("--Setting Categories Filter: ", event['categories'])
            setCategoriesFilter(event['categories']);
        } else if (event.hasOwnProperty('banks')) {
            console.log("--Setting Banks Filter")
            console.log(event);
            setInstitutionFilter(event['banks']);
        } else if (event.hasOwnProperty('startDate')) {
            console.log("--Setting Start Date Filter")
            setStartDateFilter(new Date(event['startDate']));
        } else if (event.hasOwnProperty('endDate')) {
            console.log("--Setting End Date Filter")
            setEndDateFilter(new Date(event['endDate']));
        } else {
            console.error("Unknown event: ", event);
        }

    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        eventHandler({'tag_list': tag_list})
    }

    const updateCategory = (event) => {
        // event contains an array of active entries in the select
        const categories = []
        event.forEach((item) => {
            categories.push(item.value);
        });
        eventHandler({'categories': categories});
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

    function updateInstitution(event) {
        // event institutions is an array of active entries in the select
        const banks = []
        event.forEach((item) => {
            banks.push(item.value);
        });
        eventHandler({'banks': banks});
    }

    const clearFilters = () => {
        console.log("Clear Filters");
        setStartDateFilter(null);
        setEndDateFilter(null);
        setTagSelectorHack({'tags': []});
        setClearTags(!clearTags);
        categorySelectionRef.current.clearValue();
        institutionSelectionRef.current.clearValue();
    }

    const includeInFilter = (item) => {
        var processTransaction = true;

        // Banks
        if (processTransaction && institutionFilter && institutionFilter.length > 0) {
            processTransaction = institutionFilter.includes(item.transaction.institution.id);
        }

        // Start Date
        if (processTransaction && startDateFilter) {
            // Tue Jan 17 2023 00:00:00 GMT-0800
            const filterDate = moment(startDateFilter);
            const transactionDate = moment(item.transaction.transaction_date, "YYYY-MM-DD")
            processTransaction = transactionDate >= filterDate;
        }

        // End Date
        if (processTransaction && endDateFilter) {
            const filterDate = moment(endDateFilter);
            const transactionDate = moment(item.transaction.transaction_date, "YYYY-MM-DD")
            processTransaction = transactionDate <= filterDate;
        }

        // Tags
        if (tagsFilter && tagsFilter.length > 0) {
            processTransaction = false;
            if (matchAllTags) {

            } else {
                // if none of the search tags are in the entity tags, processTransaction is False
                item.transaction.tags.forEach((tag) => {
                    tagsFilter.forEach((filter) => {
                        if (tag.id === filter.value) {
                            processTransaction = true;
                        }
                    })
                })
            }
        }

        // Categories
        if (processTransaction && categoriesFilter && categoriesFilter.length > 0) {
            processTransaction = false;
            const templateList = templatesMap.map((t) => {
                return {...t}
            })

            // console.log("Applying category filter: ", categoriesFilter);
            // check entity level category first.  If it exists use it over the template category
            // -- Could be we just wanted this entity grouped here
            if (item.transaction.category) {
                categoriesFilter.forEach((cat_id) => {
                    if (cat_id === item.transaction.category.id) {
                        processTransaction = true;
                    }
                })
            } else if (item.template_id) {
                // find category id of this template
                const category = lookupTemplateCategory(templateList, item.template_id);

                // array of ids
                categoriesFilter.forEach((cat_id) => {
                    if (cat_id === category.id) {
                        processTransaction = true;
                    }
                })
            }
        }

        return processTransaction;
    }

    const groupTransactionsByCategory = (transactions) => {
        const categoryEntries = {}
        const templateList = templatesMap.map((t) => {
            return {...t}
        })

        if(transactions === undefined) {
            console.log("Error");
            return;
        }
        transactions.forEach((item) => {
            if(includeInFilter(item)) {
                var template_category_label = 'Unknown';
                if (item.transaction.category) {
                    template_category_label = item.transaction.category.value;
                } else if (item.template_id) {
                    template_category_label = lookupTemplateCategory(templateList, item.template_id).value;
                }
                if (!categoryEntries.hasOwnProperty(template_category_label)) {
                    categoryEntries[template_category_label] = []
                }
                categoryEntries[template_category_label].push(item);
            }
        })
        return (categoryEntries);
    }

    const buildGraphLines = (buckets) => {
        const reportData = []
        const usedCategories = []
        for (const [year, data] of Object.entries(buckets)) {
            for (const [month, transactions] of Object.entries(data)) {
                if(!transactions) {
                    console.log("No transactions for month: ", month);
                    continue;
                }
                const category_groups = groupTransactionsByCategory(transactions);
                var report_entry = {name: monthCodes[month]}
                for (const [category_id, matches] of Object.entries(category_groups)) {
                    if (!usedCategories.includes(category_id)) {
                        usedCategories.push(category_id);
                    }
                    report_entry[category_id] = sumTransactions(matches);
                }
                reportData.push(report_entry)
            }
        }

        setMonthlyData(reportData);
        const lines = [];
        let ndx = 0;
        usedCategories.forEach((cat) => {
            lines.push(
                <Line
                    type="monotone"
                    dataKey={cat}
                    stroke={colorCodes[ndx]}
                />
            )
            ndx++;
            if(ndx >= colorCodes.length) ndx = 0;
        })
        return lines;
    }

    // -------------------- ASYNCHRONOUS LOADING ----------------------------
    useEffect(() => {
        if (transactionsMap.length === 0) {
            // console.log("Start - getting transactions");
            getTransactions().then((res) => setTransactionsMap(res));
            /*
                id
                institution_id
                template_id
                transaction
                    id
                    amount
                    category...
                    institution...
                    notes
                    tags
                    transaction_data
                    transaction_date

                if x.transaction.category -- use
                else if template_id -- get category from template lookup
             */
        } else if(templatesMap.length === 0 || tagsMap.length === 0) {
            console.log("Not ready...")
        } else {
            const buckets = sortTransactionsIntoMonths(transactionsMap);
            setLegendData(buildGraphLines(buckets));
            setIsLoaded(true);
        }
    }, [transactionsMap.length, templatesMap.length, tagsMap.length, categoriesFilter]);

    if (isLoaded) {
        return (<div>
                    <h1>Spending Chart</h1>
                    <ReportRow>
                        <ChartColumn>
                            <LineChart
                                width={700}
                                height={500}
                                data={monthlyData}
                                margin={{
                                    top: 15,
                                    right: 30,
                                    left: 40,
                                    bottom: 5
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                {legendData.map((item) => item)}
                            </LineChart>
                        </ChartColumn>
                        <FilterColumn>
                            <h1>Filters</h1>
                            <FilterRow>
                                <label>Categories</label>
                                <FilterSelect
                                    id="categorySelection"
                                    ref={categorySelectionRef}
                                    closeMenuOnSelect={true}
                                    options={options.sort(compareLabels)}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    menuPosition={'fixed'}
                                    onChange={updateCategory}/>
                            </FilterRow>
                            <FilterRow>
                                <div id='tagsRow'>
                                    <label>Tags</label>
                                    <TagSelector
                                      clearEntry={clearTags}
                                      tagsMap={tagsMap.sort(compareValues)}
                                      entity={tagSelectorHack}
                                      onChange={changeTag} />
                                    <button>Match all Tags</button>
                                </div>
                            </FilterRow>
                            <FilterRow>
                                <label>Banks</label>
                                <FilterSelect
                                    id="institutionSelection"
                                    ref={institutionSelectionRef}
                                    closeMenuOnSelect={true}
                                    options={banks.sort(compareLabels)}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    menuPosition={'fixed'}
                                    onChange={updateInstitution}/>
                            </FilterRow>
                            <FilterRow>
                                <div id='datesRow'>
                                    <div id='startDateDiv'>
                                        <label>Start Date</label>
                                        <DatePicker
                                          id="startDate"
                                          selected={startDateFilter}
                                          isClearable
                                          onChange={(date)=>onChangeStartDate(date)} />
                                    </div>
                                    <div id='endDateDiv'>
                                        <label id='endLabel'>End Date</label>
                                        <DatePicker
                                          id="endDate"
                                          selected={endDateFilter}
                                          isClearable
                                          onChange={(date)=>onChangeEndDate(date)} />
                                    </div>
                                </div>
                            </FilterRow>
                            <FilterRow>
                                <button onClick={clearFilters}>Clear Filters</button>
                            </FilterRow>
                        </FilterColumn>
                    </ReportRow>
                </div>
            );
    }
}

export default Reports;
