import React, {useEffect, useState} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {useLocation} from "react-router-dom";

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        // pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        // amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
    {
        name: 'Page E',
        // uv: 1890,
        pv: 4800,
        // amt: 2181,
    },
];


const Reports = () => {
    const [transactionsMap, setTransactionsMap] = useState([]);
    const [institutionGroups, setInstitutionGroups] = useState({});
    const [categoriesMap, setCategoriesMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);

    const location = useLocation();
    // console.log("Key:    ", location.key);
    // console.log("PathN:  ", location.pathname)
    // console.log("Path:   ", location.path)
    // console.log("Search: ", location.search)
    // console.log("State:  ", location.state)

    const getTransactions = async () => {
        const url = 'http://localhost:8000/resources/processed_transactions/500';
        const data = await fetch(url, {method: 'GET'})
        const str = await data.json();
        return (str);
    };

    // Function to generate random number
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    const sortTransactionsIntoMonths = () => {
        const txns = transactionsMap
        const buckets = {};
        txns.forEach((item) => {
            const working_date = Date.parse(item.transaction.transaction_date);
            var dateObject = new Date(working_date);
            const year_bucket = dateObject.getFullYear();
            const month_bucket = dateObject.getMonth();
            if(!buckets.hasOwnProperty(year_bucket)) {
                buckets[year_bucket] = {}
            }
            if(!buckets[year_bucket].hasOwnProperty(month_bucket)) {
                buckets[year_bucket][month_bucket] = []
            }
            buckets[year_bucket][month_bucket].push(item);
            // console.log(item.transaction.transaction_date + " mapped to month " + month_bucket);
        })

        const reportData = []
        for (const [year, data] of Object.entries(buckets)) {
            console.log("Bucket year: ", year);
            for (const [month, transactions] of Object.entries(data)) {
                console.log("----Month-- " + month + " has " + transactions.length + " records.");
                reportData.push({
                    name: month.toString(),
                    cat1: randomNumber(1, 100),
                    cat2: randomNumber(1, 100),
                })
            }
        }

        // {
        //     name: 'Page D',
        //     uv: 2780,
        //     pv: 3908,
        //     amt: 2000,
        // },


        setMonthlyData(reportData);

        // {Object.entries(buckets).forEach((k) => {
        //     console.log("Item " + k );
        //     for (const [month, transactions] of Object.entries(k[1])) {
        //         console.log("----Month-- " + month + " has " + transactions.length + " records.");
        //     }
        // })}

    }

    // -------------------- ASYNCHRONOUS LOADING ----------------------------
    useEffect(() => {
        if (transactionsMap.length === 0) {
            console.log("UE-06")

            console.log("Start - getting transactions");
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
        } else {
            sortTransactionsIntoMonths();
            setIsLoaded(true);
        }
    }, [transactionsMap.length]);

    if(location.pathname.includes('template')) {

    } else if(location.pathname.includes('category')) {

    } else {
        if(isLoaded) {
            console.log("txm: ", transactionsMap);
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
                    <Line
                        type="monotone"
                        dataKey='cat1'
                        stroke="#82ca9d"
                    />,
                    <Line
                        type="monotone"
                        dataKey='cat2'
                        stroke="#f2cf9d"
                    />
                </LineChart>
            </div>
            );
        }
    }

    return(
        <div>
            <h2>Reports</h2>
        </div>
    )
}

export default Reports;
