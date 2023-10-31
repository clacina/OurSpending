# Breakdown for Processed Transactions app

## Entry Point

This page is launched from the main Processed Batches page

### ProcessedTransactions - processed-transactions.component.jsx

Based on settings, it either displays a List of BankComponent(s) or a List of CategoryComponet(s)

### BankComponent - bank.component.jsx

    Displays a list of TemplateComponent(s)

#### TemplateComponent - template.component.jsx


### CategoryComponent - entity.component.jsx

Displays a list of transactions per entity

    Bank, Amount, Date, Tags, Notes

Selecting a entity displays a entity detail - TransactionDetailComponent

#### TransactionDetailComponent - entity-detail.component.jsx

Allows:
- Assign Category
- Create Template
