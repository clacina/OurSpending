import moment from "moment/moment.js";
import {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import {FerrisWheelSpinner} from 'react-spinner-overlay';
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import {TagsContext} from "../../contexts/tags.context";
import send from "../../utils/http_client.js";
import '../collapsible.scss';

import BankComponent from "./bank.component";
import CategoryComponent from "./category.component.jsx";
import HeaderComponent from "./header.component.jsx";

const ProcessedTransactions = () => {
    const {templatesMap} = useContext(TemplatesContext);
    const {addTag} = useContext(TagsContext);
    let [templateGroups, setTemplateGroups] = useState({})
    let [categoryGroups, setCategoryGroups] = useState({})

    const [transactionsMap, setTransactionsMap] = useState([]);
    const [institutionGroups, setInstitutionGroups] = useState({});

    // Content for display
    const [entityMap, setEntityMap] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState([]);

    // UI Display Flags
    const [categoryView, setCategoryView] = useState(false);
    const [categorized, setCategorized] = useState(true);

    // UI Filters
    const [tagsFilter, setTagsFilter] = useState([]);
    const [categoriesFilter, setCategoriesFilter] = useState([]);
    const [searchString, setSearchString] = useState("");
    const [matchAllTags, setMatchAllTags] = useState(false);
    const [matchAllCategories, setMatchAllCategories] = useState(false);
    const [institutionFilter, setInstitutionFilter] = useState([]);
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);

    // Data Loading Flags
    const [isLoaded, setIsLoaded] = useState(false);
    const [transactionResourcesLoaded, setTransactionResourcesLoaded] = useState(false);
    const [institutionsLoaded, setInstitutionsLoaded] = useState(false);
    let [templatesGrouped, setTemplatesGrouped] = useState(false);
    const [entityMapCreated, setEntityMapCreated] = useState(false);

    const routeParams = useParams();

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/processed_transactions/' + routeParams.batch_id;
        console.log("URL: ", url);
        const data = await fetch(url, {method: 'GET'})
        const str = await data.json();
        return (str);
    };

    // -------------------- ASYNCHRONOUS LOADING ----------------------------
    useEffect(() => {
        if (transactionsMap.length === 0) {
            console.log("UE-06")

            console.log("Start - getting transactions");
            getTransactions().then((res) => setTransactionsMap(res));
            setTransactionResourcesLoaded(true);
        }
    }, [transactionsMap.length]);

    useEffect(() => {
        console.log("UE-05")

        // Group transactions by institution
        if (transactionResourcesLoaded && transactionsMap.length && templatesMap.length) {
            const institution_groups = {};
            transactionsMap.forEach((t) => {
                if (!institution_groups.hasOwnProperty(t.institution_id)) {
                    institution_groups[t.institution_id] = [];
                }
                t.template = null;
                if (t.template_id) {
                    t.template = templatesMap.find((item) => {
                        return (item.id === t.template_id);
                    })
                }
                institution_groups[t.institution_id].push(t);
            })
            setInstitutionGroups(institution_groups);
            setInstitutionsLoaded(true);
        } else {
            console.log("No definitions yet");
        }

    }, [transactionResourcesLoaded, transactionsMap.length, templatesMap.length, transactionsMap, templatesMap]);

    const updateContent = () => {
        console.log("--updateContent")

        if (categoryView) {
            if (!categorized) {
                setCategoriesMap(Object.entries(categoryGroups).filter((item) => {
                    return (item[1][0].template === null && item[1][0].transaction.category === null);
                }));
            } else {
                setCategoriesMap(Object.entries(categoryGroups));
            }
        } else {
            setEntityMap(Object.entries(templateGroups));
        }
    }

    useEffect(() => {
        //  Populate our two data sets - one organized by template, the other organized by category
        //  - Apply any / all filters inside the two grouping routines.

        // This is triggered when setInstitutionGroups() is called
        if (institutionsLoaded) {
            console.log("UE - Filter update")
            // setTemplateGroups(groupTransactionsByTemplate());
            // setTemplatesGrouped(true);
            // setCategoryGroups(groupTransactionsByCategory());
            // updateContent();

            templateGroups = groupTransactionsByTemplate();
            templatesGrouped = true;
            categoryGroups = groupTransactionsByCategory();
            updateContent();
            setTemplateGroups(groupTransactionsByTemplate());
            setTemplatesGrouped(true);
            setCategoryGroups(groupTransactionsByCategory());

        }
    }, [institutionGroups, institutionsLoaded,
        tagsFilter, categoriesFilter, institutionFilter, startDateFilter, endDateFilter,
        matchAllTags, matchAllCategories, searchString]);

    useEffect(() => {
        if (templatesGrouped) {
            console.log("UE-01")
            // This is triggered when setTemplateGroups() is called
            setEntityMap(Object.entries(templateGroups));
        }
    }, [templatesGrouped, templateGroups]);

    useEffect(() => {
        // We're ready, so allow rendering
        if (!entityMapCreated && entityMap.length && !isLoaded) {
            console.log("UE-02")
            setIsLoaded(true);
            setEntityMapCreated(true);
        }
    }, [entityMap, entityMapCreated, isLoaded]);

    useEffect(() => {
        // Triggered when setUsingGroup() is called
        console.log("UE-03")
        updateContent();
    }, [categoryView, categorized]);

    // ----------------------------------------------------------------

    const includeInFilter = (item) => {
        var processTransaction = true;

        // Banks
        if (processTransaction && institutionFilter && institutionFilter.length > 0) {
            processTransaction = institutionFilter.includes(item.transaction.institution.id);
        }

        // Search String
        if (processTransaction && searchString && searchString.length > 0) {
            processTransaction = !!item.transaction.description.toUpperCase().includes(searchString.toUpperCase());
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
            console.log("Applying category filter: ", categoriesFilter);
            // check entity level category first.  If it exists use it over the template category
            // -- Could be we just wanted this entity grouped here
            if (item.transaction.category) {
                categoriesFilter.forEach((cat_id) => {
                    if (cat_id === item.transaction.category.id) {
                        processTransaction = true;
                    }
                })
            } else if (item.template && item.template.category) {
                // array of ids
                categoriesFilter.forEach((cat_id) => {
                    if (cat_id === item.template.category.id) {
                        processTransaction = true;
                    }
                })
            }
        }

        return processTransaction;
    }

    const groupTransactionsByTemplate = () => {
        const bankGroups = {}
        for (const [bank, transactions] of Object.entries(institutionGroups)) {
            // Apply all filters
            const templateEntries = {};
            transactions.forEach((item) => {
                if (includeInFilter(item)) {
                    if (!templateEntries.hasOwnProperty(item.template_id)) {
                        templateEntries[item.template_id] = [];
                    }
                    templateEntries[item.template_id].push(item);
                }
            })
            bankGroups[bank] = templateEntries
        }
        return bankGroups;
    }

    const groupTransactionsByCategory = () => {
        const categoryEntries = {}

        // Key is bank, value is list of processed transactions
        for (const [bank, transactions] of Object.entries(institutionGroups)) {
            transactions.forEach((item) => {
                if(includeInFilter(item)) {
                    var template_category = -1;  // no category
                    if(item.transaction.category) {
                        template_category = item.transaction.category.id;
                    }
                    else if (item.template && item.template.category) {
                        template_category = item.template.category.id;
                    }

                    if (!categoryEntries.hasOwnProperty(template_category)) {
                        categoryEntries[template_category] = []
                    }
                    categoryEntries[template_category].push(item);
                }
            })
        }
        return (categoryEntries);
    }

    const headerEventHandler = (event) => {
        console.log("PT - handlerEvent: ", event);
        // console.log("---: ", typeof event);
        if (typeof event === "string") {
            switch (event) {
                case 'templateview':
                    setCategoryView(false);
                    break;
                case 'categoryview':
                    setCategorized(true);
                    setCategoryView(true);
                    break;
                case 'noncategoryview':
                    setCategorized(!categorized);
                    break;
                case 'matchAllTags':
                    setMatchAllTags(!matchAllTags);
                    break;
                case 'matchAllCategories':
                    setMatchAllCategories(!matchAllCategories);
                    break;
                default:
                    console.log("Unknown string event: ", event);
            }
        } else {
            if (event.hasOwnProperty('transaction_id')) {
                console.log("--Setting Tags Filter")
                setTagsFilter(event['tag_list']);
            } else if (event.hasOwnProperty('categories')) {
                console.log("--Setting Categories Filter")
                setCategoriesFilter(event['categories']);
            } else if (event.hasOwnProperty('searchString')) {
                console.log("--Setting Search String Filter")
                setSearchString(event['searchString']);
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
    }

    //------------------------------ Server Callback ------------------------
    const updateTags = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        // console.log("Tags for: ", transaction_id);
        // console.log("        : ", tag_list);
        // console.log(" typeof : ", typeof tag_list);
        var body = []

        if(typeof tag_list === "string") {
            // Have TagContext handle tag add
            const newTagId = await addTag(tag_list);
            body.push(newTagId);
        } else {
            tag_list.forEach((item) => {
                body.push(item.value);
            })
        }

        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/tags';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    const updateNotes = async (transaction_id, note) => {
        var body = []

        if (note) {
            note.forEach((item) => {
                body.push({"id": item.id, "text": item.text})
            })
        }
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/notes';
        const method = 'POST'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    const updateCategory = async (transaction_id, category_id) => {
        const body = {
            'category_id': category_id
        }
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/transaction/' + transaction_id + '/category';
        const method = 'PUT'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("Response: ", request);
    }

    const viewEventHandler = (event) => {
        console.log("PT-viewEventHandler: ", event);

        if (event.hasOwnProperty('updateNotes')) {
            updateNotes(event['updateNotes']['transaction_id'], event['updateNotes']['notes']);
        } else if (event.hasOwnProperty('updateTags')) {
            updateTags(event['updateTags']['transaction_id'], event['updateTags']['tag_list']);
        } else if (event.hasOwnProperty('updateCategory')) {
            updateCategory(event['updateCategory']['transaction_id'], event['updateCategory']['category_id']);
        }
    }

    return (<>
            {!isLoaded ? <FerrisWheelSpinner loading={!isLoaded} size={38}/> : <div key='pb'>
                <h1>Processed Transactions</h1>
                <HeaderComponent eventHandler={headerEventHandler}/>
                <div>
                    {categoryView && categoriesMap.map((cat) => {
                        return (cat[1].length > 0 && <CategoryComponent
                            category={cat[1]}
                            display={categorized}
                            eventHandler={viewEventHandler}/>)
                    })}
                    {!categoryView && entityMap.map((bank) => {
                        return (<BankComponent
                            key={bank[0]}
                            bankData={bank}
                            eventHandler={viewEventHandler}/>)
                    })}
                </div>
            </div>}
        </>)
}

export default ProcessedTransactions;

/*

Template View
{
    ----- Key is template id
    "104": [
        {
            "id": 767,
            "processed_batch_id": 2,
            "entity": {
                "id": 802,
                "batch_id": 4,
                "institution": {
                    "id": 3,
                    "key": "CONE_VISA",
                    "name": "Capital One Visa",
                    "notes": null
                },
                "transaction_date": "2023-01-02",
                "transaction_data": [
                    "2023-01-02",
                    "2023-01-03",
                    "7776",
                    "Amazon web services",
                    "Other Services",
                    "1.76",
                    ""
                ],
                "tags": [
                    {
                        "id": 14,
                        "value": "Chris",
                        "notes": null,
                        "color": null
                    }
                ],
                "description": "Amazon web services",
                "amount": -1.76,
                "notes": [
                    {
                        "id": 3,
                        "note": "New note",
                        "transaction_id": 802
                    }
                ],
                "category": {
                    "id": 4,
                    "value": "Chris's Training / Development",
                    "notes": null
                },
                "keyid": "SGzhvc0vFbZHHNCmkAlkN"
            },
            "template_id": 104,
            "institution_id": 3,
            "template": {
                "id": 104,
                "credit": false,
                "hint": "Chris's Web Work",
                "notes": null,
                "category": {
                    "id": 4,
                    "value": "Chris's Training / Development",
                    "notes": null
                },
                "institution": {
                    "id": 3,
                    "key": "CONE_VISA",
                    "name": "Capital One Visa",
                    "notes": null
                },
                "tags": [
                    {
                        "id": 4,
                        "value": "Recurring",
                        "notes": null,
                        "color": "black"
                    }
                ],
                "qualifiers": [
                    {
                        "id": 14,
                        "value": "Amazon web services",
                        "institution_id": 3
                    }
                ]
            }
        },
    ]
}

Category View
{
    ---- Key is category id
    "1": [
    {
        "id": 761,
        "processed_batch_id": 2,
        "entity": {
            "id": 796,
            "batch_id": 4,
            "institution": {
                "id": 3,
                "key": "CONE_VISA",
                "name": "Capital One Visa",
                "notes": null
            },
            "transaction_date": "2023-02-18",
            "transaction_data": [
                "2023-02-18",
                "2023-02-23",
                "7776",
                "U-HAUL-CTR-12TH-L #70221",
                "Car Rental",
                "99.10",
                ""
            ],
            "tags": [],
            "description": "U-HAUL-CTR-12TH-L #70221",
            "amount": -99.1,
            "notes": [
                {
                    "id": 4,
                    "note": "Into the unknown",
                    "transaction_id": 796
                }
            ],
            "category": null,
            "keyid": "dzLySBqVRIozNUt2auNcY"
        },
        "template_id": 113,
        "institution_id": 3,
        "template": {
            "id": 113,
            "credit": false,
            "hint": "Car Rental",
            "notes": null,
            "category": {
                "id": 1,
                "value": "Unknown",
                "notes": null
            },
            "institution": {
                "id": 3,
                "key": "CONE_VISA",
                "name": "Capital One Visa",
                "notes": null
            },
            "tags": [],
            "qualifiers": [
                {
                    "id": 23,
                    "value": "Car Rental",
                    "institution_id": 3
                }
            ]
        }
    }

*/
