import {useContext, useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {useParams} from "react-router-dom";

import {StaticDataContext} from "../../contexts/static_data.context";
import {TemplatesContext} from "../../contexts/templates.context.jsx";
import Button from "../button/button-component.jsx";

import BankComponent from "./bank.component";

const ProcessedTransactions = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const {transactionDataDefinitions} = useContext(StaticDataContext);
    const {templatesMap} = useContext(TemplatesContext);
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [useGrouping, setUseGrouping] = useState(false);
    const [emap, setEmap] = useState([])
    const routeParams = useParams();

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/processed_transactions/' + routeParams.batch_id;
        const data = await fetch(url, {method: 'GET'})
        const str = await data.json();
        return (str);
    };

    useEffect(() => {
        console.log("Start");
        getTransactions().then((res) => setTransactionsMap(res));

        if (transactionsMap.length !== 0 && transactionDataDefinitions.length !== 0) {
            // Group transactions by institution
            const institution_groups = {}
            transactionsMap.forEach((t) => {
                if (!institution_groups.hasOwnProperty(t.institution_id)) {
                    institution_groups[t.institution_id] = [];
                }
                t.template = null;
                if (t.template_id) {
                    t.template = templatesMap.find((item) => {
                        return (item.id === t.template_id)
                    })
                }
                institution_groups[t.institution_id].push(t);
            })

            const template_groups = {}
            for (const [key, value] of Object.entries(institution_groups)) {
                template_groups[key] = groupTransactionsByTemplate(value);
            }

            setEmap(Object.entries(template_groups));
            setIsLoaded(true);
        } else {
            console.info("No definitions yet");
        }
    }, [transactionDataDefinitions.length, transactionsMap.length]);

    const groupTransactionsByTemplate = (entries) => {
        const templateEntries = {}

        entries.forEach((item) => {
            if (!templateEntries.hasOwnProperty(item.template_id)) {
                templateEntries[item.template_id] = [];
            }
            templateEntries[item.template_id].push(item);
        })
        return templateEntries;
    }

    const updateGrouping = (event) => {
        console.log("Got group click");
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
                {emap.map((bank) => {
                    return (<BankComponent key={bank[0]} bankData={bank}/>)
                })}
            </div>
        )
    }
}

export default ProcessedTransactions;
