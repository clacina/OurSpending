-- CREATE DATABASE IF NOT EXISTS LacinasLair;

DROP TABLE IF EXISTS institutions CASCADE;
CREATE TABLE institutions
(
    id   SERIAL PRIMARY KEY,
    key  VARCHAR(100),
    name TEXT,
    unique (key)
);

DROP TABLE IF EXISTS qualifiers CASCADE;
CREATE TABLE qualifiers
(
    id             SERIAL PRIMARY KEY,
    value          TEXT,
    institution_id INTEGER REFERENCES institutions (id) ON DELETE CASCADE NOT NULL,
    unique (value)
);

DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories
(
    id    SERIAL PRIMARY KEY,
    value TEXT,
    unique (value)
);

DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags
(
    id    SERIAL PRIMARY KEY,
    value TEXT,
    unique (value)
);

DROP TABLE IF EXISTS templates CASCADE;
CREATE TABLE templates
(
    id             SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions (id) ON DELETE CASCADE NOT NULL,
    category_id    INTEGER REFERENCES categories (id) ON DELETE CASCADE,
    credit         BOOLEAN DEFAULT FALSE,
    hint           TEXT                                                   NOT NULL,
    notes          TEXT
);

DROP TABLE IF EXISTS template_qualifiers;
CREATE TABLE template_qualifiers
(
    template_id  INTEGER REFERENCES templates (id) ON DELETE CASCADE  NOT NULL,
    qualifier_id INTEGER REFERENCES qualifiers (id) ON DELETE CASCADE NOT NULL,
    data_column  TEXT                                                          DEFAULT NULL,
    sys_period   TSTZRANGE                                            NOT NULL DEFAULT TSTZRANGE(CURRENT_TIMESTAMP, NULL),
    unique (template_id, qualifier_id, data_column)
);

DROP TABLE IF EXISTS template_qualifiers_history;
CREATE TABLE template_qualifiers_history
(
    LIKE template_qualifiers
);
DROP TRIGGER IF EXISTS template_qualifiers_versioning_trigger ON template_qualifiers;
CREATE TRIGGER template_qualifiers_versioning_trigger
    BEFORE UPDATE OR DELETE
    ON template_qualifiers
    FOR EACH ROW
EXECUTE PROCEDURE versioning(
        'sys_period', 'template_qualifiers_history', TRUE
    );


DROP TABLE IF EXISTS template_tags;
CREATE TABLE template_tags
(
    template_id INTEGER REFERENCES templates (id) ON DELETE CASCADE NOT NULL,
    tag_id      INTEGER REFERENCES tags (id) ON DELETE CASCADE      NOT NULL,
    unique (template_id, tag_id)
);


DROP TABLE IF EXISTS transaction_batch CASCADE;
CREATE TABLE transaction_batch
(
    id       SERIAL PRIMARY KEY,
    run_date TIMESTAMP NOT NULL DEFAULT NOW(),
    notes    TEXT
);


DROP TABLE IF EXISTS transaction_records CASCADE;
CREATE TABLE transaction_records
(
    id               SERIAL PRIMARY KEY,
    batch_id         INTEGER REFERENCES transaction_batch (id) ON DELETE CASCADE NOT NULL,
    institution_id   INTEGER REFERENCES institutions (id) ON DELETE CASCADE      NOT NULL,
    transaction_date DATE                                                        NOT NULL,
    transaction_data JSONB                                                       NOT NULL,
    notes            TEXT
);

DROP TABLE IF EXISTS transaction_tags;
CREATE TABLE transaction_tags
(
    transaction_id INTEGER REFERENCES transaction_records (id) ON DELETE CASCADE NOT NULL,
    tag_id         INTEGER REFERENCES tags (id) ON DELETE CASCADE                NOT NULL,
    unique (transaction_id, tag_id)
);


DROP TABLE IF EXISTS processed_transaction_batch CASCADE;
CREATE TABLE processed_transaction_batch
(
    id                   SERIAL PRIMARY KEY,
    run_date             TIMESTAMP                                                   NOT NULL DEFAULT NOW(),
    notes                TEXT,
    transaction_batch_id INTEGER REFERENCES transaction_batch (id) ON DELETE CASCADE NOT NULL
);


DROP TABLE IF EXISTS processed_transaction_records CASCADE;
CREATE TABLE processed_transaction_records
(
    id                 SERIAL PRIMARY KEY,
    processed_batch_id INTEGER REFERENCES processed_transaction_batch (id) ON DELETE CASCADE NOT NULL,
    transaction_id     INTEGER REFERENCES transaction_records (id) ON DELETE CASCADE         NOT NULL,
    template_id        INTEGER REFERENCES templates (id) ON DELETE CASCADE                   NULL DEFAULT NULL,
    institution_id     INTEGER REFERENCES institutions (id) ON DELETE CASCADE                NOT NULL
);


INSERT INTO institutions(key, name)
VALUES ('WLS_CHK', 'Wellsfargo Checking');
INSERT INTO institutions(key, name)
VALUES ('WLS_VISA', 'Wellsfargo Visa');
INSERT INTO institutions(key, name)
VALUES ('CONE_VISA', 'Capital One Visa');
INSERT INTO institutions(key, name)
VALUES ('CH_VISA', 'Chase Visa');
INSERT INTO institutions(key, name)
VALUES ('HD', 'Home Depot');
INSERT INTO institutions(key, name)
VALUES ('PP', 'PayPal');
INSERT INTO institutions(key, name)
VALUES ('LWS', 'Lowes');
INSERT INTO institutions(key, name)
VALUES ('SND_CHK_HOUSE', 'Sound Checking - House');
INSERT INTO institutions(key, name)
VALUES ('SND_CHK', 'Sound Checking - Christa');
INSERT INTO institutions(key, name)
VALUES ('SND_VISA', 'Sound Visa');
INSERT INTO institutions(key, name)
VALUES ('CC', 'Care Credit');
INSERT INTO institutions(key, name)
VALUES ('AMZN_CHRIS', 'Amazon Chris');

INSERT INTO categories(value)
VALUES ('Unknown');
INSERT INTO categories(value)
VALUES ('Amazon');
INSERT INTO categories(value)
VALUES ('Cash');
INSERT INTO categories(value)
VALUES ('Chris''s Training / Development');
INSERT INTO categories(value)
VALUES ('Credit Card Payment');
INSERT INTO categories(value)
VALUES ('Entertainment');
INSERT INTO categories(value)
VALUES ('Fast Food/Restaurant');
INSERT INTO categories(value)
VALUES ('Gas');
INSERT INTO categories(value)
VALUES ('Goods');
INSERT INTO categories(value)
VALUES ('Groceries');
INSERT INTO categories(value)
VALUES ('Hobby');
INSERT INTO categories(value)
VALUES ('Home Improvement Supplies');
INSERT INTO categories(value)
VALUES ('Interest');
INSERT INTO categories(value)
VALUES ('Loan');
INSERT INTO categories(value)
VALUES ('Medical Bill');
INSERT INTO categories(value)
VALUES ('Payment');
INSERT INTO categories(value)
VALUES ('PayPal Purchase');
INSERT INTO categories(value)
VALUES ('Pharmacy');
INSERT INTO categories(value)
VALUES ('Professional Services');
INSERT INTO categories(value)
VALUES ('Salary');
INSERT INTO categories(value)
VALUES ('Service');
INSERT INTO categories(value)
VALUES ('Thrift Store');
INSERT INTO categories(value)
VALUES ('Transfer From');
INSERT INTO categories(value)
VALUES ('Transfer To');
INSERT INTO categories(value)
VALUES ('TUV');
INSERT INTO categories(value)
VALUES ('Utility');
INSERT INTO categories(value)
VALUES ('Vet');
INSERT INTO categories(value)
VALUES ('iPhone');
INSERT INTO categories(value)
VALUES ('Return');
INSERT INTO categories(value)
VALUES ('Rent');


INSERT INTO tags(value)
VALUES ('Cable Addition');
INSERT INTO tags(value)
VALUES ('Concert');
INSERT INTO tags(value)
VALUES ('Interest Payment');
INSERT INTO tags(value)
VALUES ('Recurring');
INSERT INTO tags(value)
VALUES ('Credit Card');
INSERT INTO tags(value)
VALUES ('Gas');
INSERT INTO tags(value)
VALUES ('Loan');
INSERT INTO tags(value)
VALUES ('Transfer');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users
(
    id       SERIAL,
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100)
);

DROP TABLE IF EXISTS transaction_column_types CASCADE;
CREATE TABLE transaction_column_types
(
    data_type   VARCHAR(20) PRIMARY KEY UNIQUE
);

INSERT INTO transaction_column_types(data_type) VALUES('Date');
INSERT INTO transaction_column_types(data_type) VALUES('Time');
INSERT INTO transaction_column_types(data_type) VALUES('Email');
INSERT INTO transaction_column_types(data_type) VALUES('Currency');
INSERT INTO transaction_column_types(data_type) VALUES('String');
INSERT INTO transaction_column_types(data_type) VALUES('Number');

DROP TABLE IF EXISTS transaction_data_description CASCADE;
CREATE TABLE transaction_data_description
(
    id              SERIAL,
    institution_id  INT REFERENCES institutions (id),
    column_number   INT NOT NULL,
    column_name     TEXT NOT NULL,
    column_type     VARCHAR(20) REFERENCES transaction_column_types (data_type) DEFERRABLE,
    UNIQUE (institution_id, column_number)
);

-- Capital One institution id 3
-- Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
-- 2023-04-13,2023-04-13,7776,CAPITAL ONE ONLINE PYMT,Payment/Credit,,100.00
-- 2023-04-03,2023-04-03,7776,INTEREST CHARGE:PURCHASES,Fee/Interest Charge,11.29,
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (3, 0, 'Transaction Date', 'Date'),
    (3, 1, 'Posted Date', 'Date'),
    (3, 2, 'Card No', 'Number'),
    (3, 3, 'Description', 'String'),
    (3, 4, 'Category', 'String'),
    (3, 5, 'Debit', 'Currency'),
    (3, 6, 'Credit', 'Currency')
;

-- Care Credit id 11
-- "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
-- "5/03/2023","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","436.58","debit","Veterinary","4676","",""
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (11, 0, 'Date', 'Date'),
    (11, 1, 'Description', 'String'),
    (11, 2, 'Original Description', 'String'),
    (11, 3, 'Amount', 'Currency'),
    (11, 4, 'Transaction Type', 'String'),
    (11, 5, 'Category', 'String'),
    (11, 6, 'Account Name', 'String'),
    (11, 7, 'Labels', 'String'),
    (11, 8, 'Notes', 'String')
;

-- Chase Credit id 4
-- Transaction Date,Post Date,Description,Category,Type,Amount,Memo
-- 05/02/2023,05/03/2023,Kindle Unltd*EL3SL17V3,Shopping,Sale,-11.02,
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (4, 0, 'Transaction Date', 'Date'),
    (4, 1, 'Post Date', 'Date'),
    (4, 2, 'Description', 'String'),
    (4, 3, 'Category', 'String'),
    (4, 4, 'Type', 'String'),
    (4, 5, 'Amount', 'Currency'),
    (4, 6, 'Memo', 'String')
;

-- Home Depot id 5
-- 01/12/2023,	$-200.00,	ONLINE PAYMENT        DEERFIELD    IL	,payment
-- 12/29/2022,	$202.71	,THE HOME DEPOT           TACOMA       WA	,purchase
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (5, 0, 'Transaction Date', 'Date'),
    (5, 1, 'Amount', 'Currency'),
    (5, 2, 'Description', 'String'),
    (5, 3, 'Type', 'String')
;

-- Sound Checking - Christa, Visa, House 9, 10, 8
-- "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
-- "5/16/2023","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","28.21","debit","Shopping","S10 FREE CHECKIN","",""
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (8, 0, 'Date', 'Date'),
    (8, 1, 'Description', 'String'),
    (8, 2, 'Original Description', 'String'),
    (8, 3, 'Amount', 'Currency'),
    (8, 4, 'Transaction Type', 'String'),
    (8, 5, 'Category', 'String'),
    (8, 6, 'Account Name', 'String'),
    (8, 7, 'Labels', 'String'),
    (8, 8, 'Notes', 'String')
;

INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (9, 0, 'Date', 'Date'),
    (9, 1, 'Description', 'String'),
    (9, 2, 'Original Description', 'String'),
    (9, 3, 'Amount', 'Currency'),
    (9, 4, 'Transaction Type', 'String'),
    (9, 5, 'Category', 'String'),
    (9, 6, 'Account Name', 'String'),
    (9, 7, 'Labels', 'String'),
    (9, 8, 'Notes', 'String')
;

INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (10, 0, 'Date', 'Date'),
    (10, 1, 'Description', 'String'),
    (10, 2, 'Original Description', 'String'),
    (10, 3, 'Amount', 'Currency'),
    (10, 4, 'Transaction Type', 'String'),
    (10, 5, 'Category', 'String'),
    (10, 6, 'Account Name', 'String'),
    (10, 7, 'Labels', 'String'),
    (10, 8, 'Notes', 'String')
;

-- Wells Fargo Checking id 1
-- "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (1, 0, 'Date', 'Date'),
    (1, 1, 'Amount', 'Currency'),
    (1, 2, 'Unused 1', 'String'),
    (1, 3, 'Unused 2', 'String'),
    (1, 4, 'Description', 'String')
;

-- Wells Fargo Visa id 2
-- "04/30/2023","-9.84","*","","DRIFTGOODS"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (2, 0, 'Date', 'Date'),
    (2, 1, 'Amount', 'Currency'),
    (2, 2, 'Unused 1', 'String'),
    (2, 3, 'Unused 2', 'String'),
    (2, 4, 'Description', 'String')
;

-- Amazon id 12
-- "Website","Order ID","Order Date","Purchase Order Number","Currency","Unit Price",
-- "Unit Price Tax","Shipping Charge","Total Discounts","Total Owed","Shipment Item Subtotal",
-- "Shipment Item Subtotal Tax","ASIN","Product Condition","Quantity","Payment Instrument Type",
-- "Order Status","Shipment Status","Ship Date","Shipping Option","Shipping Address",
-- "Billing Address","Carrier Name & Tracking Number",
-- "Product Name","Gift Message","Gift Sender Name","Gift Recipient Contact Details"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (12, 0, 'Website', 'String'),
    (12, 1, 'Order ID', 'String'),
    (12, 2, 'Order Date', 'Date'),
    (12, 3, 'Purchase Order Number', 'String'),
    (12, 4, 'Currency', 'String'),
    (12, 5, 'Unit Price', 'Currency'),
    (12, 6, 'Unit Price Tax', 'String'),
    (12, 7, 'Shipping Charge', 'String'),
    (12, 8, 'Total Discounts', 'String'),
    (12, 9, 'Total Owed', 'String'),
    (12, 10, 'Shipment Item Subtotal', 'String'),
    (12, 11, 'Shipment Item Subtotal Tax', 'String'),
    (12, 12, 'ASIN', 'String'),
    (12, 13, 'Product Condition', 'String'),
    (12, 14, 'Quantity', 'String'),
    (12, 15, 'Payment Instrument Type', 'String'),
    (12, 16, 'Order Status', 'String'),
    (12, 17, 'Shipment Status', 'String'),
    (12, 18, 'Ship Date', 'String'),
    (12, 19, 'Shipping Option', 'String'),
    (12, 20, 'Shipping Address', 'String'),
    (12, 21, 'Billing Address', 'String'),
    (12, 22, 'Carrier Name & Tracking Number', 'String'),
    (12, 23, 'Product Name', 'String'),
    (12, 24, 'Gift Message', 'String'),
    (12, 25, 'Gift Sender Name', 'String'),
    (12, 26, 'Gift Recipient Contact Details', 'String')
;

-- Paypal id 6
-- "Date","Time","TimeZone","Name","Type","Status","Currency","Gross","Fee","Net",
-- "From Email Address","To Email Address","Transaction ID","Item Title","Item ID",
-- "Sales Tax","Option 1 Name","Option 1 Value","Option 2 Name","Option 2 Value",
-- "Reference Txn ID","Invoice Number","Custom Number","Quantity","Receipt ID",
-- "Balance","Subject","Note","Balance Impact"
-- "01/03/2023","13:57:10","PST","Uber Technologies, Inc","General Authorization","Pending","USD","-42.92","0.00","-42.92","clacina@mindspring.com","paypal-us@uber.com","91C639911G078574E","","","0.00","","","","","B-34X4798607464050W","2MwMW7bv4u0RhriNV6REgza0","","1","","0.00","","","Memo"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type)
VALUES
    (6, 0, 'Date', 'Date'),
    (6, 1, 'Time', 'String'),
    (6, 2, 'TimeZone', 'String'),
    (6, 3, 'Name', 'String'),
    (6, 4, 'Type', 'String'),
    (6, 5, 'Status', 'String'),
    (6, 6, 'Currency', 'String'),
    (6, 7, 'Gross', 'Currency'),
    (6, 8, 'Fee', 'String'),
    (6, 9, 'Net', 'String'),
    (6, 10, 'From Email Address', 'String'),
    (6, 11, 'To Email Address', 'String'),
    (6, 12, 'Transaction ID', 'String'),
    (6, 13, 'Item Title', 'String'),
    (6, 14, 'Item ID', 'String'),
    (6, 15, 'Sales Tax', 'String'),
    (6, 16, 'Option 1 Name', 'String'),
    (6, 17, 'Option 1 Value', 'String'),
    (6, 18, 'Option 2 Name', 'String'),
    (6, 19, 'Option 2 Value', 'String'),
    (6, 20, 'Reference Txn ID', 'String'),
    (6, 21, 'Invoice Number', 'String'),
    (6, 22, 'Custom Number', 'String'),
    (6, 23, 'Quantity', 'String'),
    (6, 24, 'Receipt ID', 'String'),
    (6, 25, 'Balance', 'String'),
    (6, 26, 'Subject', 'String'),
    (6, 27, 'Note', 'String'),
    (6, 28, 'Balance Impact', 'String')
;
