import psycopg2
from psycopg2.errors import UniqueViolation
from typing import List
import logging

TemplateSQl = """
WITH tlist AS(
SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value, t.notes as tag_notes, t.color as tag_color 
         , tt.template_id, tt.tag_id
         , c.id as category_id, c.value as category_value, c.notes as category_notes 
         , q.id AS qualifier_id, q.value as qualifier_value
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


class DBAccess:
    def __init__(self):
        # self.host = 'localhost'  # Local Server
        self.host = ' 192.168.1.89'      # Ubuntu server
        self.db = 'lacinaslair'
        self.test_db = 'lacinaslair'
        self.active_db = self.db

    def connect_to_db(self):
        try:
            conn = psycopg2.connect(
                "dbname='lacinaslair' "
                "user='lacinaslair' "
                f"host={self.host} password='gr8ful'"
            )
            return conn
        except Exception as e:
            logging.exception(f"I am unable to connect to the database:{str(e)}")
            raise e
    def get_db_cursor(self):
        conn = self.connect_to_db()
        assert conn
        return conn.cursor()

    """ Transactions """

    def query_notes_for_transaction(self, transaction_id):
        sql = """
            SELECT
                   id, note
            FROM
                transaction_notes
            WHERE
                transaction_id=%(transaction_id)s
    
        """
        query_params = {"transaction_id": transaction_id}
        cur = self.get_db_cursor()

        try:
            cur.execute(sql, query_params)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error loading transaction notes {transaction_id}: {str(e)}")
            raise e

    def clear_transaction_notes(self, transaction_id):
        sql = """
            DELETE FROM transaction_notes WHERE transaction_id = %(transaction_id)s
        """
        query_params = {"transaction_id": transaction_id}
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()

        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error loading transaction notes {transaction_id}: {str(e)}")
            raise e

    def add_note_to_transaction(self, transaction_id, note):
        sql = """
            INSERT INTO transaction_notes (transaction_id, note)
            VALUES (%(transaction_id)s, %(note)s)           
        """
        query_params = {
            'transaction_id': transaction_id,
            'note': note
        }
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()

        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error loading transaction notes {transaction_id}: {str(e)}")
            raise e

    def assign_category_to_transaction(self, transaction_id, category_id):
        sql = "UPDATE transaction_records SET category_id = %(category_id)s WHERE id=%(transaction_id)s"

        query_params = {
            'category_id': category_id,
            'transaction_id': transaction_id
        }

        conn = self.connect_to_db()
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    def query_transactions_from_batch(self, batch_id, institution_id=None, offset=0, limit=10):
        sql = f"{TransactionSQl} WHERE BID=%(batch_id)s"

        if institution_id:
            sql += f"AND BANK_ID=%(institution_id)s"
            
        sql += " ORDER BY transaction_date"
        sql += " LIMIT %(limit)s OFFSET %(offset)s"
        query_params = {"batch_id": batch_id, "offset": offset, "limit": limit}
        if institution_id:
            query_params["institution_id"] = institution_id

        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchall()
            logging.info(f"Fetched transactions: {result}")
            return result
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    def fetch_transaction(self, transaction_id):
        sql = f"{TransactionSQl} WHERE TID=%(transaction_id)s"
        query_params = {"transaction_id": transaction_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchall()
            logging.info(f"returning transaction: {result} ")
            return result
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    """ Transaction Batches """

    def list_batches(self):
        sql = "SELECT id, run_date, notes FROM transaction_batch"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def delete_batch(self, batch_id):
        conn = self.connect_to_db()
        assert conn
        sql = "DELETE FROM transaction_batch WHERE id=%(batch_id)s"
        query_params = {"batch_id": batch_id}
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def fetch_batch(self, batch_id: int):
        sql = "SELECT id, run_date, notes FROM transaction_batch WHERE id=%(batch_id)s"
        query_params = {"batch_id": batch_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchone()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    """ Processed Batches """

    def list_processed_batches(self):
        sql = """SELECT id, run_date, notes, transaction_batch_id, COALESCE(tr.cnt, 0) as tr_cnt FROM processed_transaction_batch
                left join (select batch_id, count(batch_id) as cnt from transaction_records group by batch_id) tr
                ON transaction_batch_id = tr.batch_id
              """
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def fetch_processed_batch(self, batch_id: int):
        sql = """SELECT id, run_date, notes, transaction_batch_id, COALESCE(tr.cnt, 0) as tr_cnt FROM processed_transaction_batch
                left join (select batch_id, count(batch_id) as cnt from transaction_records group by batch_id) tr
                ON transaction_batch_id = tr.batch_id
                WHERE id=%(batch_id)s
              """

        query_params = {"batch_id": batch_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchone()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def update_processed_batch_note(self, batch_id, notes):
        sql = """UPDATE processed_transaction_batch SET notes=%(notes)s WHERE id=%(batch_id)s"""
        query_params = {"batch_id": batch_id, "notes": notes}
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception({"message": f"Error updating processed batch notes: {str(e)}"})
            raise e

    def get_processed_transaction_records(self, batch_id, offset=0, limit=10):
        sql = f"{ProcessedTransactionSQL} WHERE BID=%(batch_id)s"
        sql += " LIMIT %(limit)s OFFSET %(offset)s"
        query_params = {"batch_id": batch_id, "offset": offset, "limit": limit}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    """ Institutions """

    def create_institution(self, key, name, notes):
        conn = self.connect_to_db()
        assert conn

        sql = """
            INSERT INTO
                institutions (key, name, notes) VALUES (
                    %(key)s, %(name)s, %(notes)s
                )
            RETURNING id
        """
        query_params = {"key": key, "name": name, "notes": notes}

        with conn.cursor() as cursor:
            try:
                cursor.execute(sql, query_params)
                new_id = cursor.fetchone()[0]
                print(f"Got new institution id of {new_id}")
                conn.commit()
                return new_id
            except Exception as e:
                logging.exception(f"Error: {str(e)}")
                raise e

    def fetch_institution(self, institution_id: int):
        sql = "SELECT id, key, name, notes FROM institutions WHERE id=%(institution_id)s"
        query_params = {"institution_id": institution_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchone()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def load_institutions(self):
        sql = "SELECT id, key, name, notes FROM institutions order by name"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error listing institutions: {str(e)}")
            raise e

    def update_institution(self, institution_id, name, key, notes):
        conn = self.connect_to_db()
        assert conn
        logging.info(f"Params: {name}, {key}, {notes}")
        sql = """
            UPDATE institutions
            SET name=%(name)s, key=%(key)s, notes=%(notes)s
            WHERE id=%(institution_id)s
        """
        query_params = {"institution_id": institution_id, "key": key, "name": name, "notes": notes}

        with conn.cursor() as cursor:
            try:
                cursor.execute(sql, query_params)
                conn.commit()
            except Exception as e:
                logging.exception(f"Error: {str(e)}")
                raise e

    """ Categories """

    def load_categories(self):
        sql = "SELECT id, value, notes FROM categories order by value"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error listing categories: {str(e)}")
            raise e

    def get_category(self, category_id):
        sql = "SELECT id, value FROM categories WHERE id=%(category_id)s"
        query_params = {"category_id": category_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            return row
        except Exception as e:
            logging.exception(f"Error fetching category:{category_id}: {str(e)}")
            raise e

    def create_category(self, value: str, notes: str = None):
        conn = self.connect_to_db()
        assert conn

        sql = "SELECT id FROM categories WHERE value=%(value)s"
        query_params = {"value": value, "notes": notes}
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            if row:
                return None
        except Exception as e:
            logging.exception(f"Error searching for category: {str(e)}")
            raise e

        sql = "INSERT INTO categories (value, notes) VALUES (%(value)s, %(notes)s) RETURNING id"
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            conn.commit()
            return row[0], value
        except Exception as e:
            logging.exception(f"Error creating category: {str(e)}")
            raise e

    def update_category(self, category_id: int, value: str, notes: str):
        conn = self.connect_to_db()
        assert conn

        sql = 'UPDATE categories SET value=%(value)s, notes=%(notes)s WHERE id=%(category_id)s'
        query_params = {"category_id": category_id, "value": value, "notes": notes}
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Category specified already exists: {str(e)}")
            raise e

    """ templates """

    def create_template(self,
                        institution_id: int,
                        category: str,
                        is_credit: bool,
                        hint: str,
                        notes: str,
                        qualifiers: List[str],
                        tags: List[str],
                        ):
        # does institution id exist?
        # TODO: Needs impl
        pass

    def fetch_template(self, template_id: int):
        sql = "SELECT id, institution_id, category_id, credit, hint, notes FROM templates WHERE id=%(template_id)s"
        query_params = {"template_id": template_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            return row
        except Exception as e:
            logging.exception(f"Error fetching template {template_id}: {str(e)}")
            raise e

    # -- template.id -> template_tags.template_id
    # -- template.id -> template_qualifiers.template_id
    # -- template.category_id -> categories.id
    # -- template_tags.id -> tags.id
    # -- template_qualifiers.qualifier_id -> qualifiers

    def query_templates_by_id(self, template_id):
        """
        Used by API to return information about a specific template
        Will list out qualifiers and tags
        :param template_id:
        :return: Json blob
        """
        sql = f"{TemplateSQl} WHERE TID=%(template_id)s"
        query_params = {"template_id": template_id}

        try:
            cur = self.get_db_cursor()
            cur.execute(sql, query_params)
            rows = cur.fetchall()
            logging.info(f"Returned {len(rows)} matching records.")
            logging.info(f"Rows: {rows}")
            return rows
        except Exception as e:
            logging.exception(f"Error loading Template {template_id}: {str(e)}")
            raise e

    def query_templates_by_institution(self, institution_id):
        """
        Used by API to return information about a specific template
        Will list out qualifiers and tags
        :param institution_id:
        :return: Json blob
        """
        sql = TemplateSQl

        query_params = {}
        if institution_id >= 0:
            # logging.info(f"Using institution id of {institution_id}")
            sql = f"{TemplateSQl} WHERE BANK_ID=%(institution_id)s"
            query_params = {"institution_id": institution_id}
        else:  # all templates so order by TID
            sql += " ORDER BY tlist.tid"

        try:
            cur = self.get_db_cursor()
            cur.execute(sql, query_params)
            rows = cur.fetchall()
            # logging.info(f"Returned {len(rows)} matching records.")
            # logging.info(f"Rows: {rows}")
            return rows
        except Exception as e:
            logging.exception(f"Error loading Template with institution {institution_id}: {str(e)}")
            raise e

    def update_template(self, new_template):
        # update templates, template_qualifiers and template_tags tables
        logging.info(f"Updating template to : {new_template}")
        sql = """
            UPDATE
                templates
            SET
                institution_id=%(institution_id)s,
                credit=%(credit)s,
                hint=%(hint)s,
                notes=%(notes)s,
                category_id=%(category_id)s
            WHERE
                id=%(id)s
            """

        query_params = {
            'institution_id': new_template.institution_id,
            'credit': new_template.credit,
            'hint': new_template.hint,
            'notes': new_template.notes,
            'id': new_template.id,
            'category_id': new_template.category.id
        }
        logging.info( f"Query Params: {query_params}")
        conn = self.connect_to_db()
        assert conn
        try:
            cur = conn.cursor()
            mog = cur.mogrify(sql, query_params)
            logging.info(f"MOG: {mog}")
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error updating Template with institution {new_template}: {str(e)}")
            raise e

        # Update Tags - template_tags table
        sql = "DELETE FROM template_tags WHERE template_id=%(template_id)s"
        query_params = {
            'template_id': new_template.id
        }
        try:
            cur = conn.cursor()
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error removing existing tags from Template {new_template}: {str(e)}")
            raise e

        if new_template.tags:
            sql = "INSERT INTO template_tags (template_id, tag_id) VALUES "
            for t in new_template.tags:
                sql += f"({new_template.id},{t.id}),"
            sql = sql[:-1]  # remove last ','
        try:
            cur = conn.cursor()
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error adding new tags to Template {new_template}: {str(e)}")
            raise e

        # TODO Qualifiers

    """ Tags """

    def query_tags_for_transaction(self, transaction_id: int):
        sql = """SELECT tag_id, t.id, t.value, t.notes, t.color FROM transaction_tags
                 full OUTER JOIN tags t on t.id = tag_id
                 WHERE transaction_id=%(transaction_id)s"""
        query_params = {"transaction_id": transaction_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def load_tags(self):
        sql = "SELECT id, value, notes, color FROM tags"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error listing tags: {str(e)}")
            raise e

    def fetch_tag(self, tag_id: int):
        sql = "SELECT id, value, notes, color FROM tags WHERE id=%(tag_id)s"
        query_params = {"tag_id": tag_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            return row
        except Exception as e:
            logging.exception(f"Error fetching tag {tag_id}: {str(e)}")
            raise e

    def fetch_tag_by_value(self, value: str):
        sql = "SELECT id, value, notes, color FROM tags WHERE value=%(value)s"
        query_params = {"value": value}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            return row
        except Exception as e:
            logging.exception(f"Error fetching tag {value}: {str(e)}")
            raise e

    def add_tag_to_transaction(self, transaction_id, tag_id):
        sql = "INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (%(transaction_id)s, %(tag_id)s)"
        query_params = {"transaction_id": transaction_id, "tag_id": tag_id}
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error attaching tag {tag_id} to transaction {transaction_id}: {str(e)}")
            raise e

    def create_tag(self, value: str, notes: str, color: str):
        conn = self.connect_to_db()
        assert conn

        sql = "SELECT id FROM tags WHERE value=%(value)s"
        query_params = {"value": value}
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            if row:
                return None
        except Exception as e:
            logging.exception(f"Error searching for tag: {str(e)}")
            raise e

        sql = "INSERT INTO tags (value, notes, color) VALUES (%(value)s, %(notes)s, %(color)s) RETURNING id"
        query_params['notes'] = notes
        query_params['color'] = color
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            conn.commit()
            return row[0], value, notes, color
        except Exception as e:
            logging.exception(f"Error creating tag: {str(e)}")
            raise e

    def update_tag(self, tag_id: int, value: str, notes: str, color: str):
        conn = self.connect_to_db()
        assert conn

        sql = "SELECT id FROM tags WHERE id=%(id)s"
        query_params = {"id": tag_id}
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            if not row:
                return None
        except Exception as e:
            logging.exception(f"Error searching for tag: {str(e)}")
            raise e

        sql = """UPDATE tags SET value=%(value)s, notes=%(notes)s, color=%(color)s WHERE id=%(id)s"""
        query_params['notes'] = notes
        query_params['value'] = value
        query_params['color'] = color
        try:
            cur.execute(sql, query_params)
            conn.commit()
            return tag_id, value, notes, color
        except Exception as e:
            logging.exception(f"Error creating tag: {str(e)}")
            raise e

    """ Qualifiers """

    def create_qualifer(self, value: str, institution_id: int):
        """Create a new entry in the qualifiers table and return the new id"""
        sql = """
            INSERT INTO 
                qualifiers (value, institution_id)
            VALUES (%(value)s, %(institution_id)s)
            RETURNING id
        """
        query_params = {"value": value, "institution_id": institution_id}
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            new_id = cur.fetchall()
            print(f"Got new id of {new_id}")
            conn.commit()
            return new_id
        except UniqueViolation as uv:
            logging.exception(f"Error inserting qualifier {value}: {str(uv)}")
            raise uv

        except Exception as e:
            logging.exception(f"Error inserting qualifier {value}: {str(e)}")
            raise e

    def fetch_qualifier(self, qualifier_id: int):
        """retrieve a single qualifier record by id"""
        sql = "SELECT id, value, institution_id FROM qualifiers WHERE id=%(qualifier_id)s"
        query_params = {"qualifier_id": qualifier_id}
        cur = self.get_db_cursor()
        try:
            cur.execute(sql, query_params)
            row = cur.fetchone()
            return row
        except Exception as e:
            logging.exception(f"Error fetching qualifier {qualifier_id}: {str(e)}")
            raise e

    def load_qualifiers(self):
        """load all qualifier records"""
        sql = "SELECT id, value, institution_id FROM qualifiers"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error listing qualifiers: {str(e)}")
            raise e

    def create_qualifer_from_transaction(self, conn, transaction_id):
        # get transaction and pull description
        transaction = self.fetch_transaction(transaction_id)
        assert transaction
        """ Transaction -- 
        ------------------+--------
         id               | integer
         batch_id         | integer
         institution_id   | integer
         transaction_date | date   
         transaction_data | jsonb  
         notes            | text       
         (44, 1, 4, datetime.date(2023, 1, 25),
         ['01/25/2023', '01/25/2023', 'ALEXA SKILLS*DY07F7BL3 AM', 'Shopping', 'Sale', '-0.88', ''], 'Manual Entry')
        """
        desc = transaction[4][2]
        logging.info(
            {"message": "Creating Qualifier", "data": transaction, "new qualifier": desc}
        )

        qid = self.create_qualifer(desc)
        logging.info(f"New qualifier: {qid}")
        return qid

    def load_transaction_data_descriptions(self):
        sql = "SELECT id, institution_id, column_number, column_name, column_type, is_description, is_amount, data_id, is_transaction_date from transaction_data_description"
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error listing transaction_data_description records: {str(e)}")
            raise e

    def load_saved_filters(self):
        sql = """SELECT 
                    id, name, created, institutions, categories, credit, tags, match_all_tags, start_date, end_date, search_string
                 FROM saved_filters
              """

        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
            return rows
        except Exception as e:
            logging.exception(f"Error saved filters: {str(e)}")
            raise e
