from common import db_access
from data_processing.data_models import *


def create_template(conn, entity: Entity):
    cur = conn.cursor()
    sql = """
        INSERT INTO
            templates (institution_id, category_id, credit, hint, notes)
        VALUES ( 
            %(inst)s, %(category)s, %(credit)s, %(hint)s, %(notes)s
            )
        RETURNING id;    
    """
    query_params = {
        "inst": entity.institution_id,
        "category": entity.category_id,
        "credit": entity.credit,
        "hint": entity.hint,
        "notes": entity.notes,
    }

    try:
        cur.execute(sql, query_params)
        new_id = cur.fetchall()
    except Exception as e:
        print(f"Error inserting bank entity: {str(e)}")
        raise e

    conn.commit()

    # Now create the qualifiers for this entry
    for q in entity.qualifiers:
        sql = """
            INSERT INTO
                template_qualifiers(template_id, qualifier_id)
            VALUES (
                %(template_id)s, %(qualifier_id)s
            )
        """
        query_params = {"template_id": new_id[0], "qualifier_id": q}
        try:
            cur.execute(sql, query_params)
        except Exception as e:
            print(f"Error inserting qualifier: {str(e)}")
            raise e

    conn.commit()

    # Finally the tags for the entity
    for q in entity.tags:
        sql = """
            INSERT INTO
                template_tags(template_id, tag_id)
            VALUES (
                %(template_id)s, %(tag_id)s
            )
        """
        query_params = {"template_id": new_id[0], "tag_id": q}
        try:
            cur.execute(sql, query_params)
        except Exception as e:
            print(f"Error inserting tag: {str(e)}")
            raise e

    conn.commit()


def create_qualifiers(conn, entities, institution_id):
    cur = conn.cursor()
    for k, v in entities.items():
        sql = """
            INSERT INTO 
                qualifiers (value, institution_id)
            VALUES (
                %(value)s, %(institution_id)s
                )
            ON CONFLICT DO NOTHING 
        """

        for q in v["qualifiers"]:
            query_params = {"value": q, "institution_id": institution_id}
            try:
                # print(f"sql: {sql}")
                # print(f"params: {query_params}")
                # print("Mog: {}".format(cur.mogrify(sql, query_params)))
                cur.execute(sql, query_params)
            except Exception as e:
                print(f"Error: {str(e)} -- {q}")
                raise e
    conn.commit()


# def create_qualifiers(conn, entities):
#     cur = conn.cursor()
#     for k, v in entities.items():
#         sql = """
#             INSERT INTO
#                 qualifiers (value)
#             VALUES (
#                 %(value)s
#                 )
#         """
#
#         for q in v["qualifiers"]:
#             query_params = {"value": q}
#             try:
#                 # print(f"sql: {sql}")
#                 # print(f"params: {query_params}")
#                 # print("Mog: {}".format(cur.mogrify(sql, query_params)))
#                 cur.execute(sql, query_params)
#             except Exception as e:
#                 print(f"Error: {str(e)}")
#                 raise e
#     conn.commit()


def create_tables():
    conn = db_access.DBAccess().connect_to_db()
    assert conn
    with conn.cursor() as cursor:
        try:
            cursor.execute(open("versioning.sql", "r").read())
            cursor.execute(open("init.sql", "r").read())
            conn.commit()
        except Exception as e:
            print(f"Error: {str(e)}")
            raise e


def create_template_qualifier(conn, template_id, qualifier_id):
    sql = """
        INSERT INTO 
            template_qualifiers (template_id, qualifier_id) VALUES (
            %(template_id)s, %(qualifier_id)s
            )
    """
    query_params = {"template_id": template_id, "qualifier_id": qualifier_id}

    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error inserting qualifier: {str(e)}")
        raise e
