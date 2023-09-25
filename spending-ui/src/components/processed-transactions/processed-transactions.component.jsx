import {useContext, useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {useParams} from "react-router-dom";

import {TemplatesContext} from "../../contexts/templates.context.jsx";
import Button from "../button/button-component.jsx";

import BankComponent from "./bank.component";

const ProcessedTransactions = () => {
    const {templatesMap} = useContext(TemplatesContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [templateGroups, setTemplateGroups] = useState({})
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [useGrouping, setUseGrouping] = useState(false);
    const [entityMap, setEntityMap] = useState([]);
    const [institutionGroups, setInstitutionGroups] = useState({});

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
        if(transactionsMap.length === 0) {
            console.log("Start - getting transactions");
            getTransactions().then((res) => setTransactionsMap(res));
            setTransactionResourcesLoaded(true);
        }
    }, [transactionsMap.length]);

    useEffect(() => {
        // Group transactions by institution
        // console.log("Grouping Transactions by Institution: ", transactionsMap.length);
        if(transactionResourcesLoaded && transactionsMap.length) {
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
            // console.log("Setting Inst: ", institution_groups);
            setInstitutionGroups(institution_groups);
            setInstitutionsLoaded(true);
        }
    }, [transactionResourcesLoaded, transactionsMap.length]);

    useEffect(() => {
        // This is triggered when setInstitutionGroups() is called
        if(institutionsLoaded) {
            console.log("Updating template groups");
            const template_groups = {};
            for (const [key, value] of Object.entries(institutionGroups)) {
                // console.log("Template key: ", key);
                template_groups[key] = groupTransactionsByTemplate(value);
            }
            // console.log("Setting template groups: ", template_groups);
            setTemplateGroups(template_groups);
            setTemplatesGrouped(true);
        }
    }, [institutionsLoaded]);

    useEffect(() => {
        if(templatesGrouped) {
            // This is triggered when setTemplateGroups() is called
            // console.log("Setting entityMap: ", Object.entries(templateGroups));
            setEntityMap(Object.entries(templateGroups));
        }
    }, [templatesGrouped, templateGroups]);

    useEffect(() => {
        // We're ready, so allow rendering
        if(!entityMapCreated && entityMap.length) {
            // console.log("Setting isLoaded to True - ", entityMap);
            setIsLoaded(true);
            setEntityMapCreated(true);
        }
    }, [entityMap, entityMapCreated]);

    // ----------------------------------------------------------------

    const groupTransactionsByTemplate = (entries) => {
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
        for (const [key, value] of Object.entries(institutionGroups)) {
            console.log("Key:" + key + ", value: " + value);
        }

        // entries.forEach((item) => {
        //     console.log(item);
        // })

        return categoryEntries;
    }

    const updateGrouping = (event) => {
        console.log("Got group click: ", useGrouping);
        setUseGrouping(!useGrouping);
        if(useGrouping) {
            setEntityMap(Object.entries(groupTransactionsByCategory()));
        } else {
            setEntityMap(Object.entries(templateGroups));
        }
    }

    if (isLoaded) {
        console.log("Template Groups: ", templateGroups);
        console.log("entityMap: ", entityMap);

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
                {entityMap.map((bank) => {
                    return (<BankComponent key={bank[0]} bankData={bank}/>)
                })}
            </div>
        )
    }
}

export default ProcessedTransactions;
