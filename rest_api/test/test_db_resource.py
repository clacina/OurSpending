import pytest
import random

from common.db_access import DBAccess
from common.db_access import DBResource


db_access = DBAccess()

"""
class DBResource:
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
            print(f"Executing query: {query}")
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
"""


@classmethod
def setup_class(cls):
    lh.info("starting class: {} execution".format(cls.__name__))


@classmethod
def teardown_class(cls):
    lh.info("starting class: {} execution".format(cls.__name__))


def setup_method(self, method):
    lh.info("starting execution of tc: {}".format(method.__name__))


def teardown_method(self, method):
    lh.info("starting execution of tc: {}".format(method.__name__))

class TestResource(DBResource):
    def __init__(self, conn):
        super().__init__(conn)
        self.table = 'tags'
        self.query = 'id, value, notes, color'
        self.column_count = 4

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
            query_params = {"value": data['value'], "notes": data.get('notes', None),
                            "color": data.get('color', None)}
            sql = f"INSERT INTO {self.table} (value, notes, color) VALUES (%(value)s, %(notes)s, %(color)s) RETURNING id"
            try:
                self.cursor.execute(sql, query_params)
                row = self.cursor.fetchone()
                self.conn.commit()
                return row[0], data['value']
            except Exception as e:
                print(f"Error creating tag: {str(e)}")
                raise e


@pytest.fixture()
def test_resource(request):
    print("setup")

    def teardown():
        print("teardown")

    request.addfinalizer(teardown)

    tr = TestResource(DBAccess().connect_to_db())
    return tr


class TestDBResource:
    def test_db_resource(self, test_resource):
        data = test_resource.load_all()
        assert data
        print(f"Data: {data}")

    def test_load_single(self, test_resource):
        data = test_resource.load_all()
        record = data[0]
        assert len(record) == test_resource.column_count, f"Wrong amount of data returned: {record} - {test_resource.column_count}"

        single_record = test_resource.load_single(record[0])
        assert single_record

        for i in range(0, test_resource.column_count):
            assert single_record[i] == record[i]

        assert single_record == record

    def test_create_tag(self, test_resource):
        # create a tag
        new_tag = f"testing tag {random.randint(100, 999)}"
        id, data = test_resource.insert_entry({
            "value": new_tag,
            "color": None,
            "notes": None
        })

        print(f"New tag is {id} with data: {data}")

    def test_duplicate_tag(self, test_resource):
        new_tag = f"testing tag {random.randint(100, 999)}"
        id, data = test_resource.insert_entry({
            "value": new_tag,
            "color": None,
            "notes": None
        })

        # make sure duplicate causes error
        try:
            id, data = test_resource.insert_entry({
                "value": new_tag,
                "color": None,
                "notes": None
            })
            assert 0
        except Exception as e:
            pass


