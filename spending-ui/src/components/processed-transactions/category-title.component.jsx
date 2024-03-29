import {TitleSpacer, TotalSpacer} from "./transaction_detail.component.styles.jsx";

const CategoryTitleComponent = ({category}) => {
    // total entity amount
    var categoryTotal = 0.0
    category.forEach((item) => {
        categoryTotal += item.transaction.amount;
    })

    var title = "Not Categorized";
    const uncategorized = category[0].template === null;
    if(!uncategorized) {
        title = category[0].template.category.value;
    }
    if(category[0].transaction.category) {
        title = category[0].transaction.category.value;
    }

    return(
        <div>
            <TitleSpacer>{title}</TitleSpacer>
            <TotalSpacer>${categoryTotal.toLocaleString('en-US', {maximumFractionDigits:2})} ({category.length} transactions)
            </TotalSpacer>
        </div>
    )
}

export default CategoryTitleComponent;
