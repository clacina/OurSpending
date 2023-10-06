import {useContext, useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {useParams} from "react-router-dom";

import {TemplatesContext} from "../../contexts/templates.context.jsx";

import BankComponent from "./bank.component";
import CategoryComponent from "./category.component.jsx";

const ProcessedTransactions = () => {
    const {templatesMap} = useContext(TemplatesContext);
    const [templateGroups, setTemplateGroups] = useState({})
    const [categoryGroups, setCategoryGroups] = useState({})

    const [transactionsMap, setTransactionsMap] = useState([]);
    const [institutionGroups, setInstitutionGroups] = useState({});

    // Content for display
    const [entityMap, setEntityMap] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState([]);
    const [categorizedButtonTitle, setCategorizedButtonTitle] = useState('Hide Categorized');
    const [groupByCategoryButtonTitle, setGroupByCategoryButtonTitle] = useState('Group by Category');

    // UI Display Flags
    const [useGrouping, setUseGrouping] = useState(false);
    const [categorized, setCategorized]= useState(true);

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
            console.log("Got transactions: ", transactionsMap.length);
            setTransactionResourcesLoaded(true);
        }
    }, [transactionsMap.length]);

    useEffect(() => {
        // Group transactions by institution
        console.log("Grouping Transactions by Institution: ", transactionsMap.length);
        console.log("--with templates: ", templatesMap.length);
        console.log("--and ", transactionResourcesLoaded);
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
            console.log("Unleash the Kraken!");
            setInstitutionsLoaded(true);
        } else {
            console.log("No definitions yet");
        }

    }, [transactionResourcesLoaded, transactionsMap.length, templatesMap.length, transactionsMap, templatesMap]);

    useEffect(() => {
        // This is triggered when setInstitutionGroups() is called
        if (institutionsLoaded) {
            console.log("Updating template groups");
            const template_groups = {};
            for (const [key, value] of Object.entries(institutionGroups)) {
                template_groups[key] = groupTransactionsByTemplate(value);
            }
            setTemplateGroups(template_groups);
            setTemplatesGrouped(true);

            setCategoryGroups(groupTransactionsByCategory());
        }
    }, [institutionGroups, institutionsLoaded]);

    useEffect(() => {
        if (templatesGrouped) {
            console.log("Setting entity map with templateGroups");
            // This is triggered when setTemplateGroups() is called
            setEntityMap(Object.entries(templateGroups));
        }
    }, [templatesGrouped, templateGroups]);

    useEffect(() => {
        // We're ready, so allow rendering
        if (!entityMapCreated && entityMap.length && !isLoaded) {
            console.log("Setting isLoaded to True - ", entityMap);
            setIsLoaded(true);
            setEntityMapCreated(true);
        }
    }, [entityMap, entityMapCreated, isLoaded]);

    useEffect(() => {
        // Triggered when setUsingGroup() is called
        if (useGrouping) {
            console.log("Set entity map with categories");
            if(!categorized) {
                // console.log("Filtering: ", categoryGroups);
                setCategoriesMap(Object.entries(categoryGroups).filter((item) => {
                    // console.log(item[1][0]);
                    return(item[1][0].template === null);
                }));
                setCategorizedButtonTitle("Show Categorized");
            } else {
                setCategoriesMap(Object.entries(categoryGroups));
                setCategorizedButtonTitle("Hide Categorized");
            }
            setGroupByCategoryButtonTitle("Group by Institution");
        } else {
            console.log("Set entity map with template groups");
            setEntityMap(Object.entries(templateGroups));
            setGroupByCategoryButtonTitle("Group by Category");
        }
    }, [useGrouping, categorized]);

    // ----------------------------------------------------------------

    const groupTransactionsByTemplate = (entries) => {
        console.log("groupTransactionsByTemplate");
        const templateEntries = {};

        entries.forEach((item) => {
            if (!templateEntries.hasOwnProperty(item.template_id)) {
                templateEntries[item.template_id] = [];
            }
            templateEntries[item.template_id].push(item);
        })
        return templateEntries;
    }

    const groupTransactionsByCategory = () => {
        const categoryEntries = {}
        console.log("transactionsMap: ", transactionsMap);
        console.log("institutionGroups: ", institutionGroups);
        console.log("templateGroups: ", templateGroups);
        console.log("templatesMap: ", templatesMap);

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

    const updateGrouping = (event) => {
        setUseGrouping(!useGrouping);
    }

    const updateCategorized = (event) => {
        setCategorized(!categorized);
    }

    if (isLoaded) {
        return (
            <div key='pb'>
                <Row>
                    <Col>
                        <h1>Processed Transactions</h1>
                        {useGrouping && <p>Grouped by Category</p>}
                        {useGrouping && categorized && <p>Show All</p>}
                        {useGrouping && !categorized && <p>List Uncategorized</p>}
                        {!useGrouping && <p>Grouped by Bank</p>}
                    </Col>
                    <Col>
                        <button id='set_grouping'
                                onClick={updateGrouping}>{groupByCategoryButtonTitle}</button>
                        {useGrouping &&
                            <button id='set_categorized'
                                    onClick={updateCategorized}>{categorizedButtonTitle}</button>
                        }
                    </Col>
                </Row>
                {useGrouping &&
                    categoriesMap.map((bank) => {
                        // console.log("Cat: ", bank[1]);
                        return(<CategoryComponent category={bank[1]} display={categorized}/>)
                    })}
                {!useGrouping &&
                    entityMap.map((bank) => {
                        // console.log("Cat: ", bank[1]);
                        return (<BankComponent key={bank[0]} bankData={bank}/>)
                    })
                }

            </div>
        )
    }
}

export default ProcessedTransactions;
