-- CREATE DATABASE IF NOT EXISTS LacinasLair;

DROP TABLE IF EXISTS institutions CASCADE;
CREATE TABLE institutions
(
    id   SERIAL PRIMARY KEY,
    key  VARCHAR(100),
    name TEXT,
    notes TEXT DEFAULT NULL,
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
ALTER SEQUENCE qualifiers_id_seq RESTART WITH 5000;


DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories
(
    id    SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    notes TEXT DEFAULT NULL,
    is_tax_deductible BOOLEAN DEFAULT FALSE,
    unique (value)
);
ALTER SEQUENCE categories_id_seq RESTART WITH 2000;


DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags
(
    id    SERIAL PRIMARY KEY,
    value TEXT,
    notes TEXT DEFAULT NULL,
    color VARCHAR(10) DEFAULT '#0052CC',
    unique (value)
);
ALTER SEQUENCE tags_id_seq RESTART WITH 3000;


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
ALTER SEQUENCE templates_id_seq RESTART WITH 7000;

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
    description      TEXT,
    amount           DECIMAL(10, 4),
    category_id      INTEGER REFERENCES categories (id) ON DELETE CASCADE        DEFAULT NULL,
    is_tax_deductible BOOLEAN                                                    DEFAULT FALSE
);

DROP TABLE IF EXISTS transaction_notes CASCADE;
CREATE TABLE transaction_notes
(
    id             SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transaction_records (id) ON DELETE CASCADE NOT NULL,
    note           TEXT

);
ALTER SEQUENCE transaction_notes_id_seq RESTART WITH 8000;


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
ALTER SEQUENCE processed_transaction_batch_id_seq RESTART WITH 500;


DROP TABLE IF EXISTS processed_transaction_records CASCADE;
CREATE TABLE processed_transaction_records
(
    id                 SERIAL PRIMARY KEY,
    processed_batch_id INTEGER REFERENCES processed_transaction_batch (id) ON DELETE CASCADE NOT NULL,
    transaction_id     INTEGER REFERENCES transaction_records (id) ON DELETE CASCADE         NOT NULL,
    template_id        INTEGER REFERENCES templates (id) ON DELETE CASCADE                   NULL DEFAULT NULL,
    institution_id     INTEGER REFERENCES institutions (id) ON DELETE CASCADE                NOT NULL
);
ALTER SEQUENCE processed_transaction_records_id_seq RESTART WITH 10000;

DROP TABLE IF EXISTS saved_filters CASCADE;
CREATE TABLE saved_filters
(
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL UNIQUE,
    created        TIMESTAMP NOT NULL DEFAULT NOW(),

    institutions   TEXT DEFAULT NULL,
    categories     TEXT DEFAULT NULL,
    credit         BOOLEAN DEFAULT FALSE,
    tags           TEXT DEFAULT NULL,
    match_all_tags BOOLEAN DEFAULT FALSE,
    start_date     DATE DEFAULT NULL,
    end_date       DATE DEFAULT NULL,
    search_string  TEXT DEFAULT NULL
);
ALTER SEQUENCE saved_filters_id_seq RESTART WITH 4000;

-- Data

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
INSERT INTO categories(value, is_tax_deductible)
VALUES ('Home Improvement Supplies', TRUE);
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
INSERT INTO categories(value, is_tax_deductible)
VALUES ('Professional Services', TRUE);
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

INSERT INTO tags(value, color)
VALUES ('Cable Addition', '#00B8D9');
INSERT INTO tags(value, color)
VALUES ('Concert', '#0052CC');
INSERT INTO tags(value, color)
VALUES ('Interest Payment', '#5243AA');
INSERT INTO tags(value, color)
VALUES ('Recurring', '#FF5630');
INSERT INTO tags(value, color)
VALUES ('Credit Card', '#FF8B00');
INSERT INTO tags(value, color)
VALUES ('Gas', '#36B37E');
INSERT INTO tags(value, color)
VALUES ('Loan', '#00875A');
INSERT INTO tags(value, color)
VALUES ('Transfer', '#253858');

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
    data_id         VARCHAR(20) DEFAULT NULL,
    column_type     VARCHAR(20) REFERENCES transaction_column_types (data_type) DEFERRABLE,
    is_description  BOOLEAN DEFAULT false,
    is_amount       BOOLEAN DEFAULT false,
    is_transaction_date BOOLEAN DEFAULT false,
    UNIQUE (institution_id, column_number),
    UNIQUE (institution_id, data_id)
);

-- Capital One institution id 3
-- Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
-- 2023-04-13,2023-04-13,7776,CAPITAL ONE ONLINE PYMT,Payment/Credit,,100.00
-- 2023-04-03,2023-04-03,7776,INTEREST CHARGE:PURCHASES,Fee/Interest Charge,11.29,
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (3, 0, 'Transaction Date', 'Date', false, false, true, 'transaction_date'),
    (3, 1, 'Posted Date', 'Date', false, false, false, NULL),
    (3, 2, 'Card No', 'Number', false, false, false, NULL),
    (3, 3, 'Description', 'String', true, false, false, 'description'),
    (3, 4, 'Category', 'String', false, false, false, NULL),
    (3, 5, 'Debit', 'Currency', false, true, false, 'amount'),
    (3, 6, 'Credit', 'Currency', false, true, false, NULL)
;

-- Care Credit id 11
-- "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
-- "5/03/2023","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","436.58","debit","Veterinary","4676","",""
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (11, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (11, 1, 'Description', 'String', true, false, false, 'description'),
    (11, 2, 'Original Description', 'String', false, false, false, NULL),
    (11, 3, 'Amount', 'Currency', false, true, false, 'amount'),
    (11, 4, 'Transaction Type', 'String', false, false, false, NULL),
    (11, 5, 'Category', 'String', false, false, false, NULL),
    (11, 6, 'Account Name', 'String', false, false, false, NULL),
    (11, 7, 'Labels', 'String', false, false, false, NULL),
    (11, 8, 'Notes', 'String', false, false, false, NULL)
;

-- Chase Credit id 4
-- Transaction Date,Post Date,Description,Category,Type,Amount,Memo
-- 05/02/2023,05/03/2023,Kindle Unltd*EL3SL17V3,Shopping,Sale,-11.02,
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (4, 0, 'Transaction Date', 'Date', false, false, true, 'transaction_date'),
    (4, 1, 'Post Date', 'Date', false, false, false, NULL),
    (4, 2, 'Description', 'String', true, false, false, 'description'),
    (4, 3, 'Category', 'String', false, false, false, NULL),
    (4, 4, 'Type', 'String', false, false, false, NULL),
    (4, 5, 'Amount', 'Currency', false, true, false, 'amount'),
    (4, 6, 'Memo', 'String', false, false, false, NULL)
;

-- Home Depot id 5
-- 01/12/2023,	$-200.00,	ONLINE PAYMENT        DEERFIELD    IL	,payment
-- 12/29/2022,	$202.71	,THE HOME DEPOT           TACOMA       WA	,purchase
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (5, 0, 'Transaction Date', 'Date', false, false, true, 'transaction_date'),
    (5, 1, 'Amount', 'Currency', false, true, false, 'amount'),
    (5, 2, 'Description', 'String', true, false, false, 'description'),
    (5, 3, 'Type', 'String', false, false, false, NULL)
;

-- Sound Checking - Christa, Visa, House 9, 10, 8
-- "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
-- "5/16/2023","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","28.21","debit","Shopping","S10 FREE CHECKIN","",""
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (8, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (8, 1, 'Description', 'String', true, false, false, 'description'),
    (8, 2, 'Original Description', 'String', false, false, false, NULL),
    (8, 3, 'Amount', 'Currency', false, true, false, 'amount'),
    (8, 4, 'Transaction Type', 'String', false, false, false, NULL),
    (8, 5, 'Category', 'String', false, false, false, NULL),
    (8, 6, 'Account Name', 'String', false, false, false, NULL),
    (8, 7, 'Labels', 'String', false, false, false, NULL),
    (8, 8, 'Notes', 'String', false, false, false, NULL)
;

INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (9, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (9, 1, 'Description', 'String', true, false, false, 'description'),
    (9, 2, 'Original Description', 'String', false, false, false, NULL),
    (9, 3, 'Amount', 'Currency', false, true, false, 'amount'),
    (9, 4, 'Transaction Type', 'String', false, false, false, NULL),
    (9, 5, 'Category', 'String', false, false, false, NULL),
    (9, 6, 'Account Name', 'String', false, false, false, NULL),
    (9, 7, 'Labels', 'String', false, false, false, NULL),
    (9, 8, 'Notes', 'String', false, false, false, NULL)
;

INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (10, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (10, 1, 'Description', 'String', true, false, false, 'description'),
    (10, 2, 'Original Description', 'String', false, false, false, NULL),
    (10, 3, 'Amount', 'Currency', false, true, false, 'amount'),
    (10, 4, 'Transaction Type', 'String', false, false, false, NULL),
    (10, 5, 'Category', 'String', false, false, false, NULL),
    (10, 6, 'Account Name', 'String', false, false, false, NULL),
    (10, 7, 'Labels', 'String', false, false, false, NULL),
    (10, 8, 'Notes', 'String', false, false, false, NULL)
;

-- Wells Fargo Checking id 1
-- "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (1, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (1, 1, 'Amount', 'Currency', false, true, false, 'amount'),
    (1, 2, 'Unused 1', 'String', false, false, false, NULL),
    (1, 3, 'Unused 2', 'String', false, false, false, NULL),
    (1, 4, 'Description', 'String', true, false, false, 'description')
;

-- Wells Fargo Visa id 2
-- "04/30/2023","-9.84","*","","DRIFTGOODS"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (2, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (2, 1, 'Amount', 'Currency', false, true, false, 'amount'),
    (2, 2, 'Unused 1', 'String', false, false, false, NULL),
    (2, 3, 'Unused 2', 'String', false, false, false, NULL),
    (2, 4, 'Description', 'String', true, false, false, 'description')
;

-- Amazon id 12
-- "Website","Order ID","Order Date","Purchase Order Number","Currency","Unit Price",
-- "Unit Price Tax","Shipping Charge","Total Discounts","Total Owed","Shipment Item Subtotal",
-- "Shipment Item Subtotal Tax","ASIN","Product Condition","Quantity","Payment Instrument Type",
-- "Order Status","Shipment Status","Ship Date","Shipping Option","Shipping Address",
-- "Billing Address","Carrier Name & Tracking Number",
-- "Product Name","Gift Message","Gift Sender Name","Gift Recipient Contact Details"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (12, 0, 'Website', 'String', false, false, false, NULL),
    (12, 1, 'Order ID', 'String', false, false, false, NULL),
    (12, 2, 'Order Date', 'Date', false, false, true, 'transaction_date'),
    (12, 3, 'Purchase Order Number', 'String', false, false, false, NULL),
    (12, 4, 'Currency', 'String', false, false, false, NULL),
    (12, 5, 'Unit Price', 'Currency', false, false, false, NULL),
    (12, 6, 'Unit Price Tax', 'String', false, false, false, NULL),
    (12, 7, 'Shipping Charge', 'String', false, false, false, NULL),
    (12, 8, 'Total Discounts', 'String', false, false, false, NULL),
    (12, 9, 'Total Owed', 'String', false, true, false, 'amofalse, unt'),
    (12, 10, 'Shipment Item Subtotal', 'String', false, false, false, NULL),
    (12, 11, 'Shipment Item Subtotal Tax', 'String', false, false, false, NULL),
    (12, 12, 'ASIN', 'String', false, false, false, NULL),
    (12, 13, 'Product Condition', 'String', false, false, false, NULL),
    (12, 14, 'Quantity', 'String', false, false, false, NULL),
    (12, 15, 'Payment Instrument Type', 'String', false, false, false, NULL),
    (12, 16, 'Order Status', 'String', false, false, false, NULL),
    (12, 17, 'Shipment Status', 'String', false, false, false, NULL),
    (12, 18, 'Ship Date', 'String', false, false, false, NULL),
    (12, 19, 'Shipping Option', 'String', false, false, false, NULL),
    (12, 20, 'Shipping Address', 'String', false, false, false, NULL),
    (12, 21, 'Billing Address', 'String', false, false, false, NULL),
    (12, 22, 'Carrier Name & Tracking Number', 'String', false, false, false, NULL),
    (12, 23, 'Product Name', 'String', true, false, false, 'descriptfalse, ion'),
    (12, 24, 'Gift Message', 'String', false, false, false, NULL),
    (12, 25, 'Gift Sender Name', 'String', false, false, false, NULL),
    (12, 26, 'Gift Recipient Contact Details', 'String', false, false, false, NULL)
;

-- Paypal id 6
-- "Date","Time","TimeZone","Name","Type","Status","Currency","Gross","Fee","Net",
-- "From Email Address","To Email Address","Transaction ID","Item Title","Item ID",
-- "Sales Tax","Option 1 Name","Option 1 Value","Option 2 Name","Option 2 Value",
-- "Reference Txn ID","Invoice Number","Custom Number","Quantity","Receipt ID",
-- "Balance","Subject","Note","Balance Impact"
-- "01/03/2023","13:57:10","PST","Uber Technologies, Inc","General Authorization","Pending","USD","-42.92","0.00","-42.92","clacina@mindspring.com","paypal-us@uber.com","91C639911G078574E","","","0.00","","","","","B-34X4798607464050W","2MwMW7bv4u0RhriNV6REgza0","","1","","0.00","","","Memo"
INSERT INTO
    transaction_data_description (institution_id, column_number, column_name, column_type, is_description, is_amount, is_transaction_date, data_id)
VALUES
    (6, 0, 'Date', 'Date', false, false, true, 'transaction_date'),
    (6, 1, 'Time', 'String', false, false, false, NULL),
    (6, 2, 'TimeZone', 'String', false, false, false, NULL),
    (6, 3, 'Name', 'String', true, false, false, NULL),
    (6, 4, 'Type', 'String', false, false, false, NULL),
    (6, 5, 'Status', 'String', false, false, false, NULL),
    (6, 6, 'Currency', 'String', false, false, false, NULL),
    (6, 7, 'Gross', 'Currency', false, true, false, 'amofalse, unt'),
    (6, 8, 'Fee', 'String', false, false, false, NULL),
    (6, 9, 'Net', 'String', false, false, false, NULL),
    (6, 10, 'From Email Address', 'String', false, false, false, NULL),
    (6, 11, 'To Email Address', 'String', false, false, false, NULL),
    (6, 12, 'Transaction ID', 'String', false, false, false, NULL),
    (6, 13, 'Item Title', 'String', false, false, false, 'descriptfalse, ion'),
    (6, 14, 'Item ID', 'String', false, false, false, NULL),
    (6, 15, 'Sales Tax', 'String', false, false, false, NULL),
    (6, 16, 'Option 1 Name', 'String', false, false, false, NULL),
    (6, 17, 'Option 1 Value', 'String', false, false, false, NULL),
    (6, 18, 'Option 2 Name', 'String', false, false, false, NULL),
    (6, 19, 'Option 2 Value', 'String', false, false, false, NULL),
    (6, 20, 'Reference Txn ID', 'String', false, false, false, NULL),
    (6, 21, 'Invoice Number', 'String', false, false, false, NULL),
    (6, 22, 'Custom Number', 'String', false, false, false, NULL),
    (6, 23, 'Quantity', 'String', false, false, false, NULL),
    (6, 24, 'Receipt ID', 'String', false, false, false, NULL),
    (6, 25, 'Balance', 'String', false, false, false, NULL),
    (6, 26, 'Subject', 'String', false, false, false, NULL),
    (6, 27, 'Note', 'String', false, false, false, NULL),
    (6, 28, 'Balance Impact', 'String', false, false, false, NULL)
;
