import React, {useContext, useEffect, useState} from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {TemplatesContext} from "../../contexts/templates.context.jsx";


const Reports = () => {
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);
    const [legendData, setLegendData] = useState([]);

    const {templatesMap} = useContext(TemplatesContext);

    const colorCodes = [
        '#E74C3C',
        '#FFC300',
        '#884EA0',
        '#3498DB',
        '#17A589',
        '#5D6D7E',
        '#FF1111',
        '#82E0AA',
        '#4A235A',
        '#DC7633',
    ]

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

    const sumTransactions = (transactions) => {
        var total = 0.0;
        transactions.forEach((item) => {
            total += item.transaction.amount;
        })
        return (total);
    }

    const sortTransactionsIntoMonths = () => {
        const txns = transactionsMap
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
                var report_entry = {name: month.toString()}
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


                Graph Axis
                X axis - time (month)
                Y axis - $
                Different line per category

                Dataset {
                    month
                    category1
                    category2
                    category3
                    category4
                    .
                    .
                    .
                }

                stick all transactions into month buckets

             */
        } else if(templatesMap.length === 0) {

        } else {
            const buckets = sortTransactionsIntoMonths();
            setLegendData(buildGraphLines(buckets));
            setIsLoaded(true);
        }
    }, [transactionsMap.length, templatesMap.length]);

    if (isLoaded) {
        return (<div>
                <h1>Chart Example</h1>
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
            </div>
        );
    }
}

export default Reports;
