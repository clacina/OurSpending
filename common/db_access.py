import psycopg2
from psycopg2.errors import UniqueViolation
import logging
from common.queries import TemplateSQl, TransactionSQl, ProcessedTransactionSQL, ProcessedTransactionSQLwTemplate


class DBResource:
    """
    Wrapper for typical db table access / maniuplation
    """
    def __init__(self, conn):
        self.table = None
        self.query = ""
        self.extra = None
        self.conn = conn
        self.cursor = conn.cursor()

    def _execute_query_single(self, query, params=None):
        try:
            self.cursor.execute(query, params)
            result = self.cursor.fetchone()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def _execute_query_multi(self, query, params=None):
        try:
            self.cursor.execute(query, params)
            result = self.cursor.fetchall()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def load_all(self, order_by=None):
        sql = f"SELECT {self.query} FROM {self.table} {self.extra}"
        if order_by:
            sql += f" ORDER BY {order_by}"

        return self._execute_query_multi(sql)

    def load_single(self, id):
        sql = f"SELECT {self.query} FROM {self.table}  {self.extra} WHERE id=%(id)s"
        query_params = {
            "id": id
        }
        return self._execute_query_single(sql, query_params)

    def load_query(self, query, query_params=None, order_by=None):
        """
        this takes the 'where' clause and uses the other lookup
        routines formatting
        """
        sql = f"SELECT {self.query} FROM {self.table} WHERE {query}"
        return self._execute_query_multi(sql, query_params)

    def update_entry(self, id, data):
        pass

    def delete_entry(self, id):
        query = "DELETE from {self.table} WHERE id=%(id)s"
        query_params = {"id": id}
        try:
            self.cursor.execute(query, query_params)
            self.conn.commit()
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

    def insert_entry(self, data):
        pass


class BatchContentsResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'transaction_batch_contents'
        self.query = 'id, filename, institution_id, batch_id, added_date, file_date, transaction_count, notes'


class CategoryResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'categories'
        self.query = 'id, value, is_tax_deductible, notes'

    def insert_entry(self, data):
        """
            Expected data format:
            {
                "value": New category value
                "notes": New category notes [Optional]
            }
        """
        if not self.load_query(query='value=%(value)s', query_params={'value': data['value']}):
            query_params = {"value": data['value'], "notes": data.get('notes', None)}

            sql = "INSERT INTO categories (value, notes) VALUES (%(value)s, %(notes)s) RETURNING id"
            try:
                self.cursor.execute(sql, query_params)
                row = self.cursor.fetchone()
                self.conn.commit()
                return row[0], data['value']
            except Exception as e:
                logging.exception(f"Error creating category: {str(e)}")
                raise e

    def update_entry(self, id, data):
        """
        Expected data format:
        {
            "value": New category value,
            "notes": New category notes [Optional]
            "is_tax_deductible": Optional
        }
        """
        sql = f"""UPDATE 
                    {self.table} 
                  SET 
                    value=%(value)s, 
                    notes=%(notes)s, 
                    is_tax_deductible=%(is_tax_deductible)s 
                  WHERE 
                    id=%(category_id)s"""
        query_params = {
            "category_id": id,
            "value": data['value'],
            "notes": data['notes'],
            "is_tax_deductible": data['is_tax_deductible']}
        try:
            self.cursor.execute(sql, query_params)
            self.conn.commit()
        except Exception as e:
            logging.exception(f"Category specified already exists: {str(e)}")
            raise e


class CreditCardResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'credit_cards'
        self.query = 'id, name, institution_id, interest_rate, interest_rate_cash, due_date, credit_limit'


class CreditCardDataResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'credit_card_data'
        self.query = 'card_id, balance, balance_date, minimum_payment'


class InstitutionResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'institutions'
        self.query = 'id, key, name, notes, class'

    def insert_entry(self, data):
        sql = f"""
            INSERT INTO
                {self.table} (key, name, notes, class) VALUES (
                    %(key)s, %(name)s, %(notes)s, %(class)s
                )
            RETURNING id
        """
        query_params = {
            "key": data['key'],
            "name": data['name'],
            "class": data['class'],
            "notes": data['notes']}

        with self.cursor() as cursor:
            try:
                cursor.execute(sql, query_params)
                new_id = cursor.fetchone()[0]
                self.conn.commit()
                return new_id
            except Exception as e:
                logging.exception(f"Error: {str(e)}")
                raise e

    def update_entry(self, id, data):
        """
            institution_id, name, key, notes, class
        """
        sql = f"""
            UPDATE 
                {self.table}
            SET 
                key=%(key)s, name=%(name)s, notes=%(notes)s, class=%(class)s
            WHERE 
                id=%(id)s
        """
        query_params = {
            "id": id,
            "key": data['key'],
            "name": data['name'],
            "class": data['class'],
            "notes": data['notes']}

        with self.conn.cursor() as cursor:
            try:
                cursor.execute(sql, query_params)
                self.conn.commit()
            except Exception as e:
                logging.exception(f"Error: {str(e)}")
                raise e


class LoanDataResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'loans'
        self.query = 'id, name, term, term_length, term_rate, balance, payment, due_date, loan_type, notes'


class ProcessedTransactionBatchResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = "processed_transaction_batch"
        self.query = """id, run_date, notes, transaction_batch_id, COALESCE(tr.cnt, 0) as tr_cnt """
        self.extra = """ left join (select batch_id, count(batch_id) as cnt from transaction_records group by batch_id) tr
                ON transaction_batch_id = tr.batch_id"""


class QualifierDetailResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'qualifiers'
        self.query = 'id, value, institution_id, tq.data_column'
        self.extra = """ left join template_qualifiers tq
                ON qualifiers.id = tq.qualifier_id"""


class QualifierResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'qualifiers'
        self.query = 'id, value, institution_id'


class SavedFiltersResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'saved_filters'
        self.query = 'id, name, created, institutions, categories, credit, tags, match_all_tags, start_date, end_date, search_string'


class ServicesDataResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'services'
        self.query = 'id, name, amount, due_date, notes, term_length'


class TagsResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'tags'
        self.query = 'id, value, notes, color'

    def insert_entry(self, data):
        """
            Expected data format:
            {
                "value": New category value
                "notes": New category notes [Optional]
                "color": Color string
            }
        """
        if not self.load_query(query='value=%(value)s', query_params={'value': data['value']}):
            query_params = {"value": data['value'], "notes": data.get('notes', None), "color": data.get('color', None)}
            sql = f"INSERT INTO {self.table} (value, notes, color) VALUES (%(value)s, %(notes)s, %(color)s) RETURNING id"
            try:
                self.cursor.execute(sql, query_params)
                row = self.cursor.fetchone()
                self.conn.commit()
                return row[0], data['value']
            except Exception as e:
                logging.exception(f"Error creating tag: {str(e)}")
                raise e


class TemplateResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'templates'
        self.query = 'id, institution_id, category_id, credit, hint, notes'


class TemplateQualifierResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'template_qualifiers'
        self.query = 'template_id, qualifier_id, data_column'


class TransactionBatchResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'transaction_batch'
        self.query = 'id, run_date, notes'


class TransactionDataDescriptionResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'transaction_data_description'
        self.query = 'id, institution_id, column_number, column_name, column_type, is_description, is_amount, data_id, is_transaction_date'


class TransactionNotesResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'transaction_notes'
        self.query = 'id, transaction_id, note'

    def insert_entry(self, data):
        """
        {
            'transaction_id': transaction_id,
            'note': note
        }
        """
        sql = f"INSERT INTO {self.table} (transaction_id, note) VALUES (%(transaction_id)s, %(note)s)"
        try:
            self.cursor.execute(sql, data)
            row = self.cursor.fetchone()
            self.conn.commit()
            return row[0], data['note']
        except Exception as e:
            logging.exception(f"Error creating tag: {str(e)}")
            raise e


class DBAccess:
    def __init__(self):
        # self.host = 'localhost'  # Local Server
        self.host = ' 10.0.0.100'      # Ubuntu server
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
        cr = TransactionNotesResource(self.connect_to_db())
        return cr.load_query('transaction_id=%(transaction_id)s', {"transaction_id": transaction_id})

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
        cr = TransactionNotesResource(self.connect_to_db())
        cr.insert_entry({
            'transaction_id': transaction_id,
            'note': note
        })

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
            # logging.info(f"Fetched transactions: {result}")
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
            # logging.info(f"returning transaction: {result} ")
            return result
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    """ Transaction Batches """

    def list_batches(self):
        cr = TransactionBatchResource(self.connect_to_db())
        return cr.load_all()

    def delete_batch(self, batch_id):
        cr = TransactionBatchResource(self.connect_to_db())
        return cr.delete_entry(batch_id)

    def fetch_batch(self, batch_id: int):
        cr = TransactionBatchResource(self.connect_to_db())
        return cr.load_single(batch_id)

    """ Processed Batches """

    def list_processed_batches(self):
        cr = ProcessedTransactionBatchResource(self.connect_to_db())
        return cr.load_all()

    def fetch_processed_batch(self, batch_id: int):
        cr = ProcessedTransactionBatchResource(self.connect_to_db())
        return cr.load_single(batch_id)

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

    def delete_processed_batch(self, batch_id):
        cr = ProcessedTransactionBatchResource(self.connect_to_db())
        cr.delete_entry(batch_id)

    def get_processed_transaction_records(self, batch_id, institution_id=None, offset=0, limit=10):
        sql = f"{ProcessedTransactionSQL} WHERE BID=%(batch_id)s"
        query_params = {"batch_id": batch_id, "offset": offset, "limit": limit}

        if institution_id:
            sql += " AND BANK_ID=%(institution_id)s"
            query_params['institution_id'] = institution_id

        sql += " LIMIT %(limit)s OFFSET %(offset)s"
        cur = self.get_db_cursor()
        try:
            # logging.info(f"query: {sql}")
            cur.execute(sql, query_params)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception({"message": f"Error in transaction query: {str(e)}"})
            raise e

    def update_processed_transaction(self, transaction_id, template_id):
        sql = """
                UPDATE 
                    processed_transaction_records 
                SET 
                    template_id=%(template_id)s WHERE id=%(transaction_id)s
            """
        query_params = {
            "template_id": template_id,
            "id": id
        }
        conn = self.connect_to_db()
        assert conn
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception({"message": f"Error updating processed transaction query: {str(e)}"})
            raise e

    """ Institutions """

    def create_institution(self, key, name, notes, class_name=None):
        ir = InstitutionResource(conn=self.connect_to_db())
        return ir.insert_entry({
            "key": key,
            "name": name,
            "notes": notes,
            "class": class_name
        })

    def fetch_institution(self, institution_id: int):
        ir = InstitutionResource(conn=self.connect_to_db())
        return ir.load_single(institution_id)

    def load_institutions(self):
        ir = InstitutionResource(conn=self.connect_to_db())
        return ir.load_all('name')

    def update_institution(self, institution_id, name, key, notes, class_name=None):
        ir = InstitutionResource(conn=self.connect_to_db())
        ir.update_entry(id=institution_id, data={
            "name": name,
            "key": key,
            "notes": notes,
            "class": class_name
        })

    """ Categories """

    def load_categories(self):
        cr = CategoryResource(self.connect_to_db())
        return cr.load_all(order_by='value')

    def get_category(self, category_id):
        cr = CategoryResource(self.connect_to_db())
        return cr.load_single(category_id)

    def create_category(self, value: str, notes: str = None):
        """
            returns: tuple new id, input value
        """
        cr = CategoryResource(conn=self.connect_to_db())
        return cr.insert_entry({"value": value, "notes": notes})

    def update_category(self, category_id: int, value: str, is_tax_deductible: bool, notes: str):
        cr = CategoryResource(conn=self.connect_to_db())
        cr.update_entry(category_id, {"value": value, "notes": notes, "is_tax_deductible": is_tax_deductible})

    """ Templates """

    def create_template(self,
                        hint,
                        institution_id,
                        category_id=None,
                        is_credit=False,
                        notes=None,
                        qualifiers=None,
                        tags=None,
                        ):
        conn = self.connect_to_db()
        assert conn

        sql = """
            INSERT INTO templates (hint, institution_id, credit, notes) VALUES (%(hint)s, %(institution_id)s, %(is_credit)s, %(notes)s) RETURNING id
        """
        query_params = {
            "hint": hint,
            "institution_id": institution_id,
            "is_credit": is_credit,
            "notes": notes
        }
        cur = conn.cursor()
        try:
            cur.execute(sql, query_params)
            conn.commit()
            new_id = cur.fetchone()
            logging.info(f"Got new template id: {new_id}")
        except Exception as e:
            logging.exception(f"Error creating template: {str(e)}")
            raise e

        # If a category was supplied
        if category_id:
            sql = "UPDATE templates SET category_id = %(category_id)s WHERE id=%(template_id)s"
            query_params = {
                "category_id": category_id,
                "template_id": new_id
            }
        try:
            cur.execute(sql, query_params)
            conn.commit()
        except Exception as e:
            logging.exception(f"Error updating category on template: {str(e)}")
            raise e

        # if qualifiers were provided
        if qualifiers:
            logging.info(f"Adding qualifiers: {qualifiers}")
            for q in qualifiers:
                if not q['id']:
                    # See if this qualifier already exists
                    fetch_qualifier()

                sql = """INSERT INTO 
                            template_qualifiers (template_id, qualifier_id, data_column) 
                         VALUES (%(template_id)s, %(qualifier_id)s, %(data_column)s) 
                      """
                query_params = {
                    "template_id": new_id,
                    "qualifier_id": q['id'],
                    "data_column": q['data_column']
                }
            try:
                cur.execute(sql, query_params)
                conn.commit()
            except Exception as e:
                logging.exception(f"Error updating qualifiers on template: {str(e)}")
                raise e

        # Handle any passed in tags
        if tags:
            for t in tags:
                sql = """ INSERT INTO
                            template_tags (template_id, tag_id) VALUES (%(template_id)s, %(tag_id)s)
                      """
                query_params = {
                    "template_id": new_id,
                    "tag_id": t
                }

            try:
                cur.execute(sql, query_params)
                conn.commit()
            except Exception as e:
                logging.exception(f"Error updating tags on template: {str(e)}")
                raise e

        return new_id

    def fetch_template(self, template_id: int):
        cr = TemplateResource(self.connect_to_db())
        return cr.load_single(template_id)

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
            # logging.info(f"Returned {len(rows)} matching records.")
            # logging.info(f"Rows: {rows}")
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

    def query_templates_qualifiers(self):
        cr = TemplateQualifierResource(self.connect_to_db())
        return cr.load_all()

    def query_template_qualifier_details(self):
        sql = """
                SELECT 
                    template_id, qualifier_id, data_column, q.id, q.value, q.institution_id 
                FROM template_qualifiers 
                 JOIN qualifiers q on q.id = qualifier_id
              """
        cur = self.get_db_cursor()
        try:
            cur.execute(sql)
            result = cur.fetchall()
            return result
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e

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
        tr = TagsResource(self.connect_to_db())
        return tr.load_all()

    def fetch_tag(self, tag_id: int):
        tr = TagsResource(self.connect_to_db())
        return tr.load_single(tag_id)

    def fetch_tag_by_value(self, value: str):
        tr = TagsResource(self.connect_to_db())
        return tr.load_query('value=%(value)s', {"value": value})

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
        tr = TagsResource(self.connect_to_db())
        return tr.insert_entry({"value": value, "notes": notes, "color": color})

    def update_tag(self, tag_id: int, value: str, notes: str, color: str):
        tr = TagsResource(self.connect_to_db())
        return tr.update_entry(tag_id, {"value": value, "notes": notes, "color": color})

    """ Qualifiers """

    def create_qualifier(self, value: str, institution_id: int):
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
            new_id = cur.fetchall()[0]
            conn.commit()
            return new_id
        except UniqueViolation as uv:
            logging.exception(f"Error inserting qualifier {value}: {str(uv)}")
            raise uv
        except Exception as e:
            logging.exception(f"Error inserting qualifier {value}: {str(e)}")
            raise e

    def fetch_qualifier(self, qualifier_id: int):
        qr = QualifierResource(self.connect_to_db())
        return qr.load_single(qualifier_id)

    def find_qualifier(self, value: str, institution_id: int):
        qr = QualifierResource(self.connect_to_db())
        return qr.load_query('id=%(institution_id_id)s and value=%(value)s', {"institution_id": institution_id, "value": value})
        # """retrieve a single qualifier record by id"""
        # sql = "SELECT id, value, institution_id FROM qualifiers WHERE id=%(institution_id_id)s and value=%(value)s"
        # query_params = {"institution_id": institution_id, "value": value}
        # cur = self.get_db_cursor()
        # try:
        #     cur.execute(sql, query_params)
        #     row = cur.fetchone()
        #     return row
        # except Exception as e:
        #     logging.exception(f"Error fetching qualifier {value}: {str(e)}")
        #     raise e

    def load_qualifiers(self):
        qr = QualifierResource(self.connect_to_db())
        return qr.load_all()

    def load_qualifiers_with_details(self):
        qr = QualifierDetailResource(self.connect_to_db())
        return qr.load_all()

    def load_transaction_data_descriptions(self):
        dd = TransactionDataDescriptionResource(self.connect_to_db())
        return dd.load_all()

    def load_saved_filters(self):
        sf = SavedFiltersResource(self.connect_to_db())
        return sf.load_all()

    def load_batch_contents(self):
        bc = BatchContentsResource(self.connect_to_db())
        return bc.load_all()

    def load_contents_from_batch(self, batch_id):
        bc = BatchContentsResource(self.connect_to_db())
        return bc.load_query('batch_id=%(batch_id)s', {'batch_id': batch_id})

    def load_cc_info(self):
        cc = CreditCardResource(self.connect_to_db())
        return cc.load_all()

    def load_cc_data(self, return_most_recent=False):
        ccd = CreditCardDataResource(self.connect_to_db())
        return ccd.load_all()

    def load_loans(self):
        ld = LoanDataResource(self.connect_to_db())
        return ld.load_all()

    def load_services(self):
        ls = ServicesDataResource(self.connect_to_db())
        return ls.load_all()

"""
Annual vs monthly charges
- prime
- Amazon music
- AWS
- godaddy
- ionos
- hostwind
- Xbox
- netflix
- kindle
- ring
- Disney
- xfinity
- trash
- electric
- water
- Verizon
- zmodo
- AA newsletter 
- Cricut


"""