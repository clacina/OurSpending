TemplateSQl = """
WITH tlist AS(
SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value, t.notes as tag_notes, t.color as tag_color 
         , tt.template_id, tt.tag_id
         , c.id as category_id, c.value as category_value, c.notes as category_notes 
         , q.id AS qualifier_id, q.value as qualifier_value
         , tq.data_column
         FROM templates
         JOIN institutions bank on templates.institution_id = bank.id
         full outer JOIN template_tags tt on tt.template_id = templates.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on templates.category_id = c.id
         full outer JOIN template_qualifiers tq on templates.id = tq.template_id
         full outer JOIN qualifiers q on tq.qualifier_id = q.id
) 
SELECT * FROM tlist
"""

TransactionSQl = """
WITH tlist AS(
SELECT   transaction_records.id AS TID, transaction_records.batch_id AS BID, 
         transaction_records.transaction_date, 
         transaction_records.institution_id as BANK_ID,
         transaction_records.transaction_data,
         transaction_records.description,
         transaction_records.amount
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.transaction_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , tn.id, tn.note
         FROM transaction_records
         JOIN institutions bank on transaction_records.institution_id = bank.id
         full outer JOIN transaction_tags tt on tt.transaction_id = transaction_records.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on transaction_records.category_id = c.id
         full outer JOIN transaction_notes tn on transaction_records.id = tn.transaction_id
) 
SELECT * FROM tlist
"""

ProcessedTransactionSQL = """
WITH tlist AS(
SELECT   transaction_records.id AS TID, transaction_records.batch_id, 
         transaction_records.transaction_date, 
         transaction_records.institution_id as BANK_ID,
         transaction_records.transaction_data,
         transaction_records.description,
         transaction_records.amount
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.transaction_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , tn.id, tn.note
         FROM transaction_records
         JOIN institutions bank on transaction_records.institution_id = bank.id
         full outer JOIN transaction_tags tt on tt.transaction_id = transaction_records.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on transaction_records.category_id = c.id
         full outer JOIN transaction_notes tn on transaction_records.id = tn.transaction_id
),


plist AS (
SELECT   processed_transaction_records.id as PID,
         processed_transaction_records.processed_batch_id as BID, 
         processed_transaction_records.institution_id,
         processed_transaction_records.template_id, processed_transaction_records.transaction_id,
         tr.*         
FROM 
         processed_transaction_records
JOIN 
         tlist tr on processed_transaction_records.transaction_id = tr.TID
)
SELECT * FROM plist
"""


ProcessedTransactionSQLwTemplate = """
WITH tlist AS(
SELECT   transaction_records.id AS TID, transaction_records.batch_id, 
         transaction_records.transaction_date, 
         transaction_records.institution_id as BANK_ID,
         transaction_records.transaction_data,
         transaction_records.description,
         transaction_records.amount
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.transaction_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , tn.id, tn.note
         , tmp.id, tmp.category_id, tmp.hint, tmp.credit, tmp.notes
         FROM transaction_records
         JOIN institutions bank on transaction_records.institution_id = bank.id
         full outer JOIN transaction_tags tt on tt.transaction_id = transaction_records.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on transaction_records.category_id = c.id
         full outer JOIN transaction_notes tn on transaction_records.id = tn.transaction_id
),

plist AS (
SELECT   processed_transaction_records.id as PID,
         processed_transaction_records.processed_batch_id as BID, 
         processed_transaction_records.institution_id,
         processed_transaction_records.template_id, processed_transaction_records.transaction_id,
         tr.*         
FROM 
         processed_transaction_records
JOIN 
         tlist tr on processed_transaction_records.transaction_id = tr.TID
)
SELECT * FROM plist
"""
