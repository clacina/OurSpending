# Wipe and Rebuild DB

Running setup.py will `drop` all tables and recreate them 
via running the 'init.sql' file.

It will parse 'datafiles/original_data.py' and generate
content from them.

<b>DO NOT run unless you have a backup of the DB!!</b>

## Rebuild Steps

1. Run setup.py
2. Run the 'Create Institution' script to add Amazon
3. Run the main script with the 'load' argument   
   1. ```python main.py load```
   - You can also specify a specific folder to load (WIP)
   - This loads the datafile and creates records in the 'transaction_records' table.
   - These are grouped together by a 'batch_id' stored in the 'transaction_batch' table.
4. Run the main script with 'batch' argument   
   1. ```python main batch```
   2. this performs the template matching and creates a set of transactions grouped by category, these are stored in the 'processed_transaction_records' table.   
   3. these are grouped by a 'processed_batch_id' and stored in the 'processed_transaction_batch' table.
5. Now you can run reports against the processed batch
   1. ```python main templatereport --batch {batch id}```
   2. You need to specify the id of the processed batch created in the previous step.
   3. 
