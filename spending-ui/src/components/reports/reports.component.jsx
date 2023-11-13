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
import Nav from "react-bootstrap/Nav";
import DatePicker from "react-datepicker";

// Sort comparators
function compareLabels(a, b) {
    return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
}

function compareValues(a, b) {
    return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
}

const getTransactions = async () => {
    const url = 'http://localhost:8000/resources/processed_transactions/501';
    const data = await fetch(url, {method: 'GET'})
    const str = await data.json();
    return (str);
};

const lookupTemplateCategory = (template_list, template_id) => {
    const item_id = template_list.find((item) => {
        return (item.id === template_id);
    })
    return(item_id.category);
}

const sumTransactions = (transactions) => {
    var total = 0.0;
    transactions.forEach((item) => {
        total += item.transaction.amount;
    })
    return (total);
}

const sortTransactionsIntoMonths = (txns) => {
    // const txns = transactionsMap
    const buckets = {};
    txns.forEach((item) => {
        const working_date = Date.parse(item.transaction.transaction_date);
        var dateObject = new Date(working_date);
        const year_bucket = dateObject.getFullYear();
        const month_bucket = dateObject.getMonth();
        if (!buckets.hasOwnProperty(year_bucket)) {
            buckets[year_bucket] = {}
        }
        if (!buckets[year_bucket].hasOwnProperty(month_bucket)) {
            buckets[year_bucket][month_bucket] = []
        }
        buckets[year_bucket][month_bucket].push(item);
    })
    return buckets;
}

const colorCodes = [
    '#E74C3C',
    '#FFC300',
    '#884EA0',
    '#3498DB',
    '#17A589',
    '#5D6D7E',
    '#FF1111',
    '#82E0AA',
    '#000080',
    '#4A235A',
    '#808000',
    '#DC7633',
    '#00FF00'
]

const monthCodes = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]


const Reports = () => {
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);
    const [legendData, setLegendData] = useState([]);
    const [startDateFilter, setStartDateFilter] = useState();
    const [endDateFilter, setEndDateFilter] = useState();
    const [clearTags, setClearTags] = useState(false);

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
    }

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
        return true;
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
                    if(!usedCategories.includes(category_id)) {
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

        } else {
            const buckets = sortTransactionsIntoMonths(transactionsMap);
            setLegendData(buildGraphLines(buckets));
            console.log("Starting with tags: ", tagsMap)
            setIsLoaded(true);
        }
    }, [transactionsMap.length, templatesMap.length, tagsMap.length]);

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
                        </FilterColumn>
                    </ReportRow>
                </div>
            );
    }
}

export default Reports;
