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
    sys_period   TSTZRANGE                                            NOT NULL DEFAULT TSTZRANGE(CURRENT_TIMESTAMP, NULL),
    unique (template_id, qualifier_id)
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

DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    id       SERIAL,
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100)
);
