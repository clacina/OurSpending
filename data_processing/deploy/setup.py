import sys

sys.path.append("../..")

from common.db_access import DBAccess
import data_processing.datafiles.original_data as entities
from data_processing.data_models import *
import db_utils
import argparse

# Initialize parser
parser = argparse.ArgumentParser()

# Adding optional argument
parser.add_argument("-c", "--create", action=argparse.BooleanOptionalAction, help="Drop and Create all Tables")
parser.add_argument("-p", "--populate", action=argparse.BooleanOptionalAction, help="Populate Tables")
parser.add_argument("-e", "--entities", action=argparse.BooleanOptionalAction, help="Generate Entities")

# Read arguments from command line
args = parser.parse_args()


""" ------------------------------------ Entry Point ------------------------------------"""
db_access = DBAccess()
conn = db_access.connect_to_db()
assert conn

if args.create:
    db_utils.create_tables()


if args.populate:
    institutions = db_access.load_institutions()

    db_utils.create_qualifiers(
        conn,
        entities.carecredit_entities,
        [x[0] for x in institutions if x[1] == "CC"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.chase_entities,
        [x[0] for x in institutions if x[1] == "CH_VISA"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.capitalone_entities,
        [x[0] for x in institutions if x[1] == "CAP_VISA"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.homedepot_entities,
        [x[0] for x in institutions if x[1] == "HD"][0],
    )
    db_utils.create_qualifiers(
        conn, entities.lowes_entities, [x[0] for x in institutions if x[1] == "LWS"][0]
    )
    db_utils.create_qualifiers(
        conn, entities.paypal_entities, [x[0] for x in institutions if x[1] == "PP-Chris"][0]
    )
    db_utils.create_qualifiers(
        conn,
        entities.sound_checking_entities,
        [x[0] for x in institutions if x[1] == "SND_CHK_HOUSE"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.sound_checking_entities_christa,
        [x[0] for x in institutions if x[1] == "SND_CHK"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.sound_visa_entities,
        [x[0] for x in institutions if x[1] == "SND_VISA"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.wells_checking_entities,
        [x[0] for x in institutions if x[1] == "WLS_CHK"][0],
    )
    db_utils.create_qualifiers(
        conn,
        entities.wells_visa_entities,
        [x[0] for x in institutions if x[1] == "WLS_VISA"][0],
    )

if args.entities:
    institutions = db_access.load_institutions()
    categories = db_access.load_categories()
    tags = db_access.load_tags()
    qualifiers = db_access.load_qualifiers()

    entity_mapping = {
        "CareCredit": {"id": "CC", "entries": entities.carecredit_entities},
        "Wells Checking": {"id": "WLS_CHK", "entries": entities.wells_checking_entities},
        "Wells Visa": {"id": "WLS_VISA", "entries": entities.wells_visa_entities},
        "Capital One Visa": {"id": "CAP_VISA", "entries": entities.capitalone_entities},
        "Chase Visa": {"id": "CH_VISA", "entries": entities.chase_entities},
        "Home Depot": {"id": "HD", "entries": entities.homedepot_entities},
        "PayPal - Chris": {"id": "PP-Chris", "entries": entities.paypal_entities},
        "Lowes": {"id": "LWS", "entries": entities.lowes_entities},
        "Sound Checking - House": {
            "id": "SND_CHK_HOUSE",
            "entries": entities.sound_checking_entities,
        },
        "Sound Checking - Christa": {
            "id": "SND_CHK",
            "entries": entities.sound_checking_entities_christa,
        },
        "Sound Visa": {"id": "SND_VISA", "entries": entities.sound_visa_entities},
    }

    # Create banking Entities
    bank_entities = list()
    for inst, data in entity_mapping.items():
        print(f"Populating {inst}")
        inst_id = [x[0] for x in institutions if x[1] == data["id"]][0]
        print(f"--id: {inst_id}")

        for k, v in data["entries"].items():
            ent = Entity(inst_id)
            ent.parse(v)
            ent.category_id = [x[0] for x in categories if x[1] == v["category"]]
            if ent.category_id:
                ent.category_id = ent.category_id[
                    0
                ]  # from list comprehension above so just return one element
            else:
                ent.category_id = [x[0] for x in categories if x[1] == "Unknown"][0]
            bank_entities.append(ent)

            # find qualifiers for this entity and create them
            for q in v["qualifiers"]:
                qid = [x[0] for x in qualifiers if x[1] == q][0]
                ent.qualifiers.append(qid)

            # find tags for this entity and create them
            for t in v["tags"]:
                try:
                    tid = [x[0] for x in tags if x[1].upper() == t.upper()][0]
                    ent.tags.append(tid)
                except Exception as e:
                    print(f"Cant find tag {t}: {str(e)}")
                    raise e

    print("Creating bank entities")
    for bank in bank_entities:
        db_utils.create_template(conn, bank)
