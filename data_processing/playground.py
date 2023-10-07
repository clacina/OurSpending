import random
import sys

# append the path of the
# parent directory
sys.path.append("..")
from common import db_access


def scenario1():
    conn = db_access.connect_to_db()
    assert conn
    sql = "select id from lacinaslair.public.transaction_records where batch_id=7"
    cur = conn.cursor()
    try:
        cur.execute(sql)
        result = cur.fetchall()
        return result
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


data = scenario1()
data = [d[0] for d in data]
print(data)

conn = db_access.connect_to_db()
assert conn

for t in data[39:]:
    sql = "insert into lacinaslair.public.transaction_tags (transaction_id, tag_id) VALUES ( %(transaction_id)s, %(tag_id)s )"
    query_params = {
        'transaction_id': t,
        'tag_id': random.randint(1,8)
    }
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error: {str(e)}")
        continue

