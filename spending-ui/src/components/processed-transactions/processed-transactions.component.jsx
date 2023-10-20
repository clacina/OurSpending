import moment from "moment/moment.js";
import {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {TemplatesContext} from "../../contexts/templates.context.jsx";

import BankComponent from "./bank.component";
import CategoryComponent from "./category.component.jsx";
import HeaderComponent from "./header.component.jsx";

const ProcessedTransactions = () => {
    const {templatesMap} = useContext(TemplatesContext);
    const [templateGroups, setTemplateGroups] = useState({})
    const [categoryGroups, setCategoryGroups] = useState({})

    const [transactionsMap, setTransactionsMap] = useState([]);
    const [institutionGroups, setInstitutionGroups] = useState({});

    // Content for display
    const [entityMap, setEntityMap] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState([]);
    // const [categorizedButtonTitle, setCategorizedButtonTitle] = useState('Hide Categorized');
    // const [groupByCategoryButtonTitle, setGroupByCategoryButtonTitle] = useState('Group by Category');

    // UI Display Flags
    const [categoryView, setCategoryView] = useState(false);
    const [categorized, setCategorized]= useState(true);

    // UI Filters
    const [tagsFilter, setTagsFilter] = useState([]);
    const [categoriesFilter, setCategoriesFilter] = useState([]);
    const [searchString, setSearchString] = useState("");
    const [matchAllTags, setMatchAllTags] = useState(false);
    const [matchAllCategories, setMatchAllCategories] = useState(false);
    const [institutionFilter, setInstitutionFilter] = useState([]);
    const [matchAllInstitutions, setMatchAllInstitutions] = useState(false);
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);

    // Data Loading Flags
    const [isLoaded, setIsLoaded] = useState(false);
    const [transactionResourcesLoaded, setTransactionResourcesLoaded] = useState(false);
    const [institutionsLoaded, setInstitutionsLoaded] = useState(false);
    const [templatesGrouped, setTemplatesGrouped] = useState(false);
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
            console.log("Start - getting transactions");
            getTransactions().then((res) => setTransactionsMap(res));
            setTransactionResourcesLoaded(true);
        }
    }, [transactionsMap.length]);

    useEffect(() => {
        // Group transactions by institution
        // console.log("Grouping Transactions by Institution: ", transactionsMap.length);
        // console.log("--with templates: ", templatesMap.length);
        // console.log("--and ", transactionResourcesLoaded);
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
            // console.log("Unleash the Kraken!");
            setInstitutionsLoaded(true);
        } else {
            console.log("No definitions yet");
        }

    }, [transactionResourcesLoaded, transactionsMap.length, templatesMap.length, transactionsMap, templatesMap]);

    useEffect(() => {
        //  Populate our two data sets - one organized by template, the other organized by category
        //  - Apply any / all filters inside the two grouping routines.

        // This is triggered when setInstitutionGroups() is called
        if (institutionsLoaded) {
            console.log("Updating template groups");
            const template_groups = {};
            for (const [key, value] of Object.entries(institutionGroups)) {
                template_groups[key] = groupTransactionsByTemplate(value);
            }
            setTemplateGroups(template_groups);
            setTemplatesGrouped(true);

            console.log("Updating category groups");
            setCategoryGroups(groupTransactionsByCategory());
        }
    }, [institutionGroups, institutionsLoaded,
        tagsFilter, categoriesFilter, institutionFilter,
        startDateFilter, endDateFilter,
        matchAllTags, matchAllCategories, matchAllInstitutions,
        searchString]);

    useEffect(() => {
        if (templatesGrouped) {
            // console.log("Setting entity map with templateGroups");
            // This is triggered when setTemplateGroups() is called
            setEntityMap(Object.entries(templateGroups));
        }
    }, [templatesGrouped, templateGroups]);

    useEffect(() => {
        // We're ready, so allow rendering
        if (!entityMapCreated && entityMap.length && !isLoaded) {
            // console.log("Setting isLoaded to True - ", entityMap);
            setIsLoaded(true);
            setEntityMapCreated(true);
        }
    }, [entityMap, entityMapCreated, isLoaded]);

    useEffect(() => {
        // Triggered when setUsingGroup() is called
        if (categoryView) {
            // console.log("Set entity map with categories");
            if(!categorized) {
                // console.log("Filtering: ", categoryGroups);
                setCategoriesMap(Object.entries(categoryGroups).filter((item) => {
                    // console.log(item[1][0]);
                    return(item[1][0].template === null);
                }));
                // setCategorizedButtonTitle("Show Categorized");
            } else {
                setCategoriesMap(Object.entries(categoryGroups));
                // setCategorizedButtonTitle("Hide Categorized");
            }
            // setGroupByCategoryButtonTitle("Group by Institution");
        } else {
            // console.log("Set entity map with template groups");
            setEntityMap(Object.entries(templateGroups));
            // setGroupByCategoryButtonTitle("Group by Category");
        }
    }, [categoryView, categorized]);

    // ----------------------------------------------------------------

    const groupTransactionsByTemplate = (entries) => {
        const templateEntries = {};

        // Apply all filters

        entries.forEach((item) => {
            // item.transaction.tags
            // item.template.category.id
            // item.transaction.category.id - probably null
            var processTransaction = true;

            // Banks
            if(processTransaction && institutionFilter && institutionFilter.length > 0) {
                processTransaction = institutionFilter.includes(item.transaction.institution.id);
            }

            // Search String
            if(processTransaction && searchString && searchString.length > 0) {
                processTransaction = !!item.transaction.description.toUpperCase().includes(searchString.toUpperCase());
            }

            // Start Date
            if(processTransaction && startDateFilter) {
                // Tue Jan 17 2023 00:00:00 GMT-0800
                const filterDate = moment(startDateFilter);
                const transactionDate = moment(item.transaction.transaction_date, "YYYY-MM-DD")
                processTransaction = transactionDate >= filterDate;
            }

            // End Date
            if(processTransaction && endDateFilter) {
                const filterDate = moment(endDateFilter);
                const transactionDate = moment(item.transaction.transaction_date, "YYYY-MM-DD")
                processTransaction = transactionDate <= filterDate;
            }

            // Tags
            if(tagsFilter && tagsFilter.length > 0) {
                processTransaction = false;
                if(matchAllTags) {

                } else {
                    // if none of the search tags are in the transaction tags, processTransaction is False
                    item.transaction.tags.forEach((tag) => {
                        tagsFilter.forEach((filter) => {
                            if(tag.id === filter.value) {
                                processTransaction = true;
                            }
                        })
                    })
                }
            }

            // Categories
            if(processTransaction && categoriesFilter && categoriesFilter.length > 0) {
                processTransaction = false;

                // check transaction level category first.  If it exists use it over the template category
                // -- Could be we just wanted this transaction grouped here
                if(item.transaction.category) {
                    categoriesFilter.forEach((cat_id) => {
                        if (cat_id === item.template.category.id) {
                            processTransaction = true;
                        }
                    })
                } else if(item.template && item.template.category) {
                    // array of ids
                    categoriesFilter.forEach((cat_id) => {
                        if (cat_id === item.template.category.id) {
                            processTransaction = true;
                        }
                    })
                }
            }

            if(processTransaction) {
                if (!templateEntries.hasOwnProperty(item.template_id)) {
                    templateEntries[item.template_id] = [];
                }
                templateEntries[item.template_id].push(item);
            }
        })
        return templateEntries;
    }

    const groupTransactionsByCategory = () => {
        const categoryEntries = {}
        // console.log("transactionsMap: ", transactionsMap);
        // console.log("institutionGroups: ", institutionGroups);
        // console.log("templateGroups: ", templateGroups);
        // console.log("templatesMap: ", templatesMap);

        // Key is bank, value is list of processed transactions
        categoryEntries['-1'] = []
        for (const [bank, transactions] of Object.entries(institutionGroups)) {
            transactions.forEach((item) => {
                if (item.template && item.template.category) {
                    const template_category = item.template.category.id;
                    if (!categoryEntries.hasOwnProperty(template_category)) {
                        categoryEntries[template_category] = []
                    }
                    categoryEntries[template_category].push(item);
                } else {
                    categoryEntries['-1'].push(item);
                }
            });
        }
        // console.log("CategoryEntries: ", categoryEntries);
        return (categoryEntries);
    }

    const headerEventHandler = (event) => {
        console.log("PT - event: ", event);
        console.log("---: ", typeof event);
        if(typeof event === "string") {
            switch(event) {
                case 'templateview':
                    setCategoryView(false);
                    break;
                case 'categoryview':
                    setCategoryView(true);
                    break;
                case 'matchAllTags':
                    setMatchAllTags(!matchAllTags);
                    break;
                case 'matchAllCategories':
                    setMatchAllCategories(!matchAllCategories);
                    break;
                case 'matchAllInstitutions':
                    setMatchAllInstitutions(!matchAllInstitutions);
                    break;
                default:
                    console.log("Unknown string event: ", event);
            }
        } else {
            if(event.hasOwnProperty('transaction_id')) {
                setTagsFilter(event['tag_list']);
            } else if(event.hasOwnProperty('categories')) {
                setCategoriesFilter(event['categories']);
            } else if(event.hasOwnProperty('searchString')) {
                setSearchString(event['searchString']);
            } else if(event.hasOwnProperty('banks')) {
                console.log(event);
                setInstitutionFilter(event['banks']);
            } else if(event.hasOwnProperty('startDate')) {
                setStartDateFilter(new Date(event['startDate']));
            } else if(event.hasOwnProperty('endDate')) {
                setEndDateFilter(new Date(event['endDate']));
            } else {
                console.error("Unknown event: ", event);
            }
        }
    }

    if (isLoaded) {
        return (
            <div key='pb'>
                <h1>Processed Transactions</h1>
                <HeaderComponent eventHandler={headerEventHandler}/>
                <div>
                    {categoryView &&
                        categoriesMap.map((bank) => {
                            // console.log("Cat: ", bank);
                            return ( bank[1].length > 0 && <CategoryComponent category={bank[1]} display={categorized}/>)
                        })}
                    {!categoryView &&
                        entityMap.map((bank) => {
                            // console.log("Cat: ", bank[1]);
                            return (<BankComponent key={bank[0]} bankData={bank}/>)
                        })
                    }
                </div>
            </div>
        )
    }
}

export default ProcessedTransactions;
