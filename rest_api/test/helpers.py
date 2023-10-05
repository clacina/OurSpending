# Helper functions for test routines

from common import db_access


def get_batch_ids():
    result = db_access.list_batches()

    id_list = [x[0] for x in result];
    return id_list


