import {useContext, useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {useParams} from "react-router-dom";

import {TemplatesContext} from "../../contexts/templates.context.jsx";
import Button from "../button/button-component.jsx";

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

    // UI Display Flags
    const [useGrouping, setUseGrouping] = useState(false);

    // Data Loading Flags
    const [isLoaded, setIsLoaded] = useState(false);
    const [transactionResourcesLoaded, setTransactionResourcesLoaded] = useState(false);
    const [institutionsLoaded, setInstitutionsLoaded] = useState(false);
    const [templatesGrouped, setTemplatesGrouped] = useState(false);
    const [entityMapCreated, setEntityMapCreated] = useState(false);

    const routeParams = useParams();

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/processed_transactions/' + routeParams.batch_id;
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
        console.log("Grouping Transactions by Institution: ", transactionsMap.length);
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
        }
    }, [transactionResourcesLoaded, transactionsMap.length, templatesMap.length]);

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
    }, [institutionsLoaded]);

    useEffect(() => {
        if (templatesGrouped) {
            console.log("Setting entity map with templateGroups");
            // This is triggered when setTemplateGroups() is called
            setEntityMap(Object.entries(templateGroups));
            console.log("Type: ", typeof entityMap);
        }
    }, [templatesGrouped, templateGroups]);

    useEffect(() => {
        // We're ready, so allow rendering
        if (!entityMapCreated && entityMap.length && !isLoaded) {
            console.log("Setting isLoaded to True - ", entityMap);
            setIsLoaded(true);
            setEntityMapCreated(true);
        }
    }, [entityMap, entityMapCreated]);

    useEffect(() => {
        // Triggered when setUsingGroup() is called
        if (useGrouping) {
            console.log("Set entity map with categories");
            setCategoriesMap(Object.entries(categoryGroups));
        } else {
            console.log("Set entity map with template groups");
            setEntityMap(Object.entries(templateGroups));
        }
    }, [useGrouping]);

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

    if (isLoaded) {
        return (
            <div key='pb'>
                <Row>
                    <Col>
                        <h1>Processed Transactions</h1>
                    </Col>
                    <Col>
                        <Button buttonType='google-sign-in'
                                id='set_grouping'
                                onClick={updateGrouping}>Group by Category</Button>
                    </Col>
                </Row>
                {useGrouping &&
                    categoriesMap.map((bank) => {
                        console.log("Cat: ", bank[1]);
                        return(<CategoryComponent category={bank[1]}/>)
                    })}
                {/*{!useGrouping &&*/}
                {/*    entityMap.map((bank) => {*/}
                {/*        return (<BankComponent key={bank[0]} bankData={bank}/>)*/}
                {/*    })*/}
                {/*}*/}

            </div>
        )
    }
}

export default ProcessedTransactions;
