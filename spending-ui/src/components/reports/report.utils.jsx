

// Sort comparators
export function compareLabels(a, b) {
    return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
}

export function compareValues(a, b) {
    return ('' + a.value.toLowerCase()).localeCompare(b.value.toLowerCase());
}

export const getTransactions = async () => {
    const url = 'http://localhost:8000/resources/processed_transactions/501';
    const data = await fetch(url, {method: 'GET'})
    const str = await data.json();
    return (str);
};

export const lookupTemplateCategory = (template_list, template_id) => {
    const item_id = template_list.find((item) => {
        return (item.id === template_id);
    })
    return(item_id.category);
}

export const sumTransactions = (transactions) => {
    var total = 0.0;
    transactions.forEach((item) => {
        total += Math.abs(item.transaction.amount);
    })
    return (Math.round(total * 1000) / 1000);
}

export const sortTransactionsIntoMonths = (txns) => {
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

export const colorCodes = [
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

export const monthCodes = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]
