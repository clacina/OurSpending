# Bank Processing

An attempt to process our bank statements / activity reports to genreate a spending breakdown
that will allow us to better understand where our money goes.

## End View - Post Processing
We want to be able to view all transactions from all accounts
and categorize them, label and tag them.

The building of the templates system provides a set of 'templates'
that convert a given transaction into something we understand.

We will store the converted transactions along with a json blob of
their original content in separate tables.

Additionally, we will be able to annotate processed results.

## Entities

Entities are institutions that we send or receive money from.

- Starbucks
- WSDOT
- Fred Meyer Fuel

An Entity contains:
- Category / Section
- Tags
- Hint

### Qualifiers
An Entity is identified by one or more qualifiers.  These are key words found in the description 
of an entry (Line Item).

Entity qualifiers are unique per bank / institution.  For instance, a entry in the Wells Fargo 
statement may read:

    "02/15/2023","-82.50","*","","PURCHASE AUTHORIZED ON 02/14 AMAZON.COM*HE6PP7J AMZN.COM/BILL WA S383046079692709 CARD 0094"

while a similar entry from Capital One would read:

    03/31/2023,04/02/2023,AMZN Mktp US*HY8040TS2,Shopping,Sale,-102.84,


## Line Items

A Line Item is an instance of an Entity in a bank statement.  It will include things like the transaction
date, the amount, etc.

______

# Run / Deployment

For Debug configurations:

This will run the app on port 8080 and will (supposedly) reload if any source code chages.




    PS C:\Users\claci\bank_processing> uvicorn app.app:app --port=8080 --host=0.0.0.0 --reload-dir app

## Setup Server

In the deploy folder you will run `setup.py`.  Check the database connection parameters in 
`common/db_access.py`.

## Connecting to Our Ubuntu Server

### Database Connection Parameters

Server IP is `10.0.0.20`

Role: `lacinaslair`

Password: `gr8ful`

Table: `lacinaslair`

### Login Parameters

Host: `clacina@devserver`

Password: `Aki4202023`

-------

# Package Configuration

Under bank_processing:

## app



## deploy


## processing

This is a FastAPI application serving up our REST API.
