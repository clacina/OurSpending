from flask import current_app

from data_processing import db_utils
from data_processing.base import match_template_qualifiers


class ProcessedRecordInfo:
    def __init__(self, record):
        self.transaction_id = record[0]
        self.template_id = record[3]
        self.category_id = record[18]
        self.institution_id = record[8]
        self.transaction_data = record[9]
        self.description = record[10]
        self.category = ''  # need to pull in qualifier field
        self.new_template_id = None

    def to_json(self):
        return {
            "transaction_id": self.transaction_id,
            "template_id": self.template_id,
            "category_id": self.category_id,
            "institution_id": self.institution_id,
            "transaction_data": self.transaction_data,
            "description": self.description,
            "category": self.category,
            "new_template_id": self.new_template_id
        }

    def __repr__(self):
        return f"{self.transaction_id},{self.template_id},{self.new_template_id},{self.institution_id},{self.category_id},{self.description}"


def match_qualifiers(batch_id, qualifiers, institution_id):
    """
    batch_id == the id of the ProcessedBatch
    the processed_transaction_batch record will contain hte transaction_batch_id

    processed_transaction_records
    - processed_batch_id
    - transaction_id
    - template_id
    - institution_id

    Loop through the processed_transaction_records WHERE processed_batch_id = batch_id
        AND institution_id=template.institution_id

        - Check the specified transaction, if it has a category assigned, leave it (unless override_category is TRUE).
        - Perform a template match on the transaction.
            If it is different from the assigned template_id, add out our mod list
    """
    # Get our processed records
    current_app.logger.info(f"Getting processed transaction records {batch_id}")
    processed_records = db_utils.db_access.get_processed_transaction_records(batch_id, institution_id=institution_id,
                                                                             limit=10000)

    entries = []
    record_count = 0

    # Reformat input
    matches_to = []
    for q in qualifiers:
        matches_to.append((q['value'], q['data_column']))

    for record in processed_records:
        entry = ProcessedRecordInfo(record)
        if entry.institution_id == institution_id:
            record_count += 1
            found_match = match_template_qualifiers(qualifiers=matches_to, transaction=entry)
            if found_match:
                entries.append(entry.to_json())

    results = {'entries': entries,
               'qualifiers': qualifiers,
               'institution_id': institution_id}
    current_app.logger.info(f"results: {results}")

    return results


def find_template_matches(batch_id, qualifiers, institution_id, template_id):
    """
    batch_id == the id of the ProcessedBatch
    the processed_transaction_batch record will contain hte transaction_batch_id

    processed_transaction_records
    - processed_batch_id
    - transaction_id
    - template_id
    - institution_id

    Loop through the processed_transaction_records WHERE processed_batch_id = batch_id
        AND institution_id=template.institution_id

        - Check the specified transaction, if it has a category assigned, leave it (unless override_category is TRUE).
        - Perform a template match on the transaction.
            If it is different than the assigned template_id, add out our mod list
    """
    # Get our processed records
    processed_records = db_utils.db_access.get_processed_transaction_records(batch_id, limit=10000)
    current_app.logger.info(f"Processed Record: {processed_records[0]}")
    """
       0     1   2    3    4    5   6              7                8
    (21734, 522, 1, None, 433, 433, 3, datetime.date(2023, 12, 29), 1,
                                        9
     ['12/29/2023', '-23.34', '*', '', 'PURCHASE AUTHORIZED ON 12/28 BRH INTERNATIONAL
     213-3256928 NV S383362670157115 CARD 0094'],
                                        10 
     'PURCHASE AUTHORIZED ON 12/28 BRH INTERNATIONAL 213-3256928 NV S383362670157115 CARD 0094',
                11                  12                13 
     Decimal('-23.3400'), 'Wells Fargo Checking', 'WLS_CHK',
       14       15            16              17 
     tag_id, tag_value, transaction_id, transaction_tag_id
       18            19
     category_id, category_value
       20                      21
     transaction_note_id, transaction_note  
    """

    entries = []
    current_app.logger.info(f"Checking {len(processed_records)} transactions")
    record_count = 0
    for record in processed_records:
        entry = ProcessedRecordInfo(record)
        if entry.institution_id == institution_id:
            # assumes the parameter has a .description, a .category and .qualifiers (list of strings)
            record_count += 1
            found_match = match_template(qualifiers=qualifiers, transaction=entry)
            if found_match:
                entry.new_template_id = template_id
                entries.append(entry)

    current_template = db_utils.db_access.fetch_template(template_id)
    current_app.logger.info(f"Existing Template: {current_template}")
    """
    0         1              2           3       4            5
    id, institution_id, category_id,  credit,  hint,        notes 
    (7243, 2,              2017,      False, 'Pills', 'Delivery Pills')
    """
    current_app.logger.info(f"Found matching bank records: {record_count}")
    current_app.logger.info(f"Found matching entries: {len(entries)}")
    current_app.logger.info(entries)
    results = []
    found_templates = {}
    found_categories = {}
    if current_template[2]:  # has existing category
        """
        id, value, is_tax_deductible, notes
        """
        found_categories[current_template[2]] = db_utils.db_access.get_category(current_template[2])

    for e in entries:
        if e.new_template_id not in found_templates:
            found_templates[e.new_template_id] = db_utils.db_access.fetch_template(e.new_template_id)
            nt = found_templates[e.new_template_id]  # new template record
            tc = nt[2]  # template category
            if tc and tc not in found_categories:
                found_categories[tc] = db_utils.db_access.get_category(tc)

        new_template = found_templates[e.new_template_id]
        assert new_template, "Coulnt find template"

        new_category = found_categories[new_template[2]]
        assert new_category, f"Couldnt find category for {new_template}"

        results.append({
            'transaction_id': e.transaction_id,
            'current_template': {
                'category': found_categories[current_template[2]][1],
                'template_id': e.template_id,
                'template_hint': current_template[4],
                'template_notes': current_template[5],
                'template_credit': current_template[3],
            },
            'proposed_template': {
                'category': new_category[1],
                'template_id': e.new_template_id,
                'template_hint': new_template[4],
                'template_notes': new_template[5],
                'template_credit': new_template[3],
            },
            'transaction_data': e.transaction_data
        })
    return results
