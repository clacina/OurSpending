import logging

from flask import Flask, request, json, jsonify

from data_processing.backend import *
from data_processing.logger import setup_rich_logger
from data_processing.processors import select_processors_from_batch
from data_processing.base import match_template

from apiflask import APIFlask, Schema, abort
from apiflask.fields import Integer, String
from apiflask.validators import Length, OneOf

setup_rich_logger()

# set openapi.info.title and openapi.info.version
app = APIFlask(__name__, title='Data Processing', version='1.0')

# All the OpenAPI field config can be set with the corresponding attributes of the app instance:
# app.description = '...'

# openapi.info.description
app.config['DESCRIPTION'] = """
Expose access to the data processing side of the solution.  This includes the ability to
load datafiles and processes them.

```
$ cd OurSpending
$ cd data_processing
$ flask run --host=0.0.0.0 --port=8880 --reload
```

The source can be found at [github][_blueprint_tags].

[_blueprint_tags]: https://github.com/clacina/OurSpending
"""

# openapi.info.contact
# app.config['CONTACT'] = {
#     'name': 'API Support',
#     'url': 'https://greyli.com/en',
#     'email': 'withlihui@gmail.com'
# }

# openapi.info.license
# app.config['LICENSE'] = {
#     'name': 'MIT',
#     'url': 'https://opensource.org/licenses/MIT'
# }

# openapi.info.termsOfService
# app.config['TERMS_OF_SERVICE'] = 'http://example.com'

# The four info fields above can be set with the INFO key:
# app.config['INFO'] = {
#     'description': '...',
#     'termsOfService': 'http://example.com',
#     'contact': {
#         'name': 'API Support',
#         'url': 'http://www.example.com/support',
#         'email': 'support@example.com'
#     },
#     'license': {
#          'name': 'Apache 2.0',
#          'url': 'http://www.apache.org/licenses/LICENSE-2.0.html'
#      }
# }

# openapi.tags
# app.config['TAGS'] = [
#     {'name': 'Hello', 'description': 'The description of the **Hello** tag.'},
#     {'name': 'Pet', 'description': 'The description of the **Pet** tag.'}
# ]

# If you don't need to set tag "description" or tag "externalDocs", just pass a list a string:
app.config['TAGS'] = ['Batches', 'Actions', 'Reports']

# openapi.servers
app.config['SERVERS'] = [
    {
        'name': 'Development Server',
        'url': 'http://192.168.1.77:8880'
    },
    {
        'name': 'Production Server',
        'url': 'http://api.example.com'
    },
    {
        'name': 'Testing Server',
        'url': 'http://test.example.com'
    }
]

# openapi.externalDocs
app.config['EXTERNAL_DOCS'] = {
    'description': 'Find more info here',
    'url': 'https://apiflask.com/docs'
}

"""
# Schema Examples
pets = [
    {'id': 0, 'name': 'Kitty', 'category': 'cat'},
    {'id': 1, 'name': 'Coco', 'category': 'dog'},
    {'id': 2, 'name': 'Flash', 'category': 'cat'}
]


class PetIn(Schema):
    name = String(
        required=True,
        validate=Length(0, 10),
        metadata={'title': 'Pet Name', 'description': 'The name of the pet.'}
    )
    category = String(
        required=True,
        validate=OneOf(['dog', 'cat']),
        metadata={'title': 'Pet Category', 'description': 'The category of the pet.'}
    )


class PetOut(Schema):
    id = Integer(metadata={'title': 'Pet ID', 'description': 'The ID of the pet.'})
    name = String(metadata={'title': 'Pet Name', 'description': 'The name of the pet.'})
    category = String(metadata={'title': 'Pet Category', 'description': 'The category of the pet.'})
"""


@app.get('/')
def root():
    return 'Hello World'


tags_metadata = [
    {"name": "Batches"},
    {"name": "Actions"},
    {"name": "Reports"},
]


# ---------------------------------- Command Line Interface Handling (CLI) ------------------------------------

class LoadSchema(Schema):
    source = String(metadata={'title': 'Source Folder', 'description': 'Folder to load.'})
    fileentry = String(metadata={'title': 'File Source', 'description': 'Single file to load.'})
    override = Integer(metadata={'title': 'Batch Override', 'description': 'Replace contents of specified batch.'})
    notes = String(metadata={'title': 'Notes', 'description': 'Optional notes for this batch.'})


class ProcessSchema(Schema):
    batch_id = Integer()
    notes = String()


@app.post('/import')
@app.input(LoadSchema, location='json')
@app.doc(tags=['Batches'])
def load_datafiles(payload):
    """Load activity reports for processing."""
    # logging.info(f"Loading data files...{request.json}")
    # payload = request.json
    logging.info(f"Loading data files...{payload}")

    source = payload.get('source', None)
    fileentry = payload.get('file', None)
    override = payload.get('override', None)
    notes = payload.get('notes', None)

    """Load activity reports for processing."""
    print(f"Got source: {source}, file: {fileentry}, override: {override}, notes: {notes}")
    processors = load_sources(source, fileentry)
    if not override:
        batch_id = create_batch(processors, notes)
        print(f"Batch Created: {batch_id}")
    else:
        update_batch(processors, override, notes)
        print(f"Updated Batch: {override}")

    return 'Create batch 333'


@app.route('/process', methods=['POST'])
@app.doc(tags=['Batches'])
@app.input(ProcessSchema, location='json')
def process_a_transaction_batch(json_data):
    logging.info(f"Process payload - 'process_a_transaction_batch' : {json_data}")
    payload = json_data

    batch_id = payload.get('batch_id', None)
    notes = payload.get('notes', None)

    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id, notes=notes)
    logging.info(
        f"Running transaction batch: {batch_id} into processing batch: {processed_batch_id}"
    )

    # Create a list of processors from the specified batch
    all_processors = select_processors_from_batch(batch_id)

    # Now build our list of processors from the above institution list
    for processor_info in all_processors:
        cp = configure_processor(
            datafile=None,
            processor_class=processor_info[0],
            institution_id=processor_info[1][0]
        )

        cp.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)

    resp = json_data
    resp["processed_batch_id"] = processed_batch_id
    logging.info(f"Returning response: {jsonify(resp)}")
    return jsonify(resp)


@app.route('/templatereport/<batch_id>')
@app.doc(tags=['Reports'])
def template_report(batch_id: int):
    return f"Creating template report for batch {batch_id}"


#     if not batch_id:
#         batch_id = present_processed_batch_menu_select()
#
#     """Generate a Template Verification Report from a Processed Batch"""
#     report_data = reports.ReportData()
#     report_data.categories = db_utils.db_access.load_categories()
#     report_data.tags = db_utils.db_access.load_tags()
#     report_data.institutions = db_utils.db_access.load_institutions()
#     all_processors = settings.create_configs()
#
#     for bank in all_processors:
#         bank.analyze_data(processed_batch_id=batch_id)
#
#     reports.Reporting(report_data).template_verification_report(
#         all_processors,
#         "report_output/template_verification.html",
#         include_extras=True,
#         include_spending=True,
#     )


@app.route('/categoryreport/<batch_id>')
@app.doc(tags=['Reports'])
def category_report(batch_id: int):
    """Generate a Category Breakdown Report"""
    return f"Creating a category report for processed batch: {batch_id}"


#     if not batch_id:
#         batch_id = present_processed_batch_menu_select()
#
#     report_data = reports.ReportData()
#     report_data.categories = db_utils.db_access.load_categories()
#     report_data.tags = db_utils.db_access.load_tags()
#     report_data.institutions = db_utils.db_access.load_institutions()
#     all_processors = settings.create_configs()
#
#     for bank in all_processors:
#         bank.analyze_data(processed_batch_id=batch_id)
#
#     reports.Reporting(report_data).category_verification_report(
#         all_processors,
#         "report_output/categories.html",
#     )


"""----------------------------Actions--------------------------"""


@app.post("/processed_batch/<batch_id>/rerun")
@app.doc(tags=['Actions'])
async def rereun_processed_batch(batch_id: int):
    return f"Rerunning batch {batch_id}"


# @app.route("/batch/<batch_id>/process", methods=["POST"])
# @app.doc(tags=['Actions'])
# def process_batch(batch_id: int):
#     logging.info(f"process_batch: {batch_id}")
#     json_data = json.loads(request.get_data())
#     logging.info(f"Json data: {json_data}")
#     processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id, notes=json_data['notes'])
#     logging.info(f"Running transaction batch: {batch_id} into processing batch: {processed_batch_id}")
#
#     # Now build our list of processors from the above institution list
#     all_processors = select_processors_from_batch(batch_id)
#
#     logging.info("a")
#     for processor_info in all_processors:
#         cp = configure_processor(
#             datafile=None,
#             processor_class=processor_info[0],
#             institution_id=processor_info[1][0]
#         )
#
#         cp.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)
#     logging.info("b")
#     resp = json_data
#     resp["processed_batch_id"] = processed_batch_id
#     logging.info(f"Returning response: {jsonify(resp)}")
#     return jsonify(resp)


def match_templates_dup(self, batch_id: int, processed_batch_id: int):
    """
    This loads the given transaction_batch from the database and then analyzes each
    transaction:
        First it finds a matching template for the transaction
        if successful:
            Updates the Spending Dictionary as well as the
            Category Breakdown Dictionary
        otherwise it adds the transaction to the 'Extras' list
    :param batch_id: batch to process
           processed_batch_id:
    :return: None
    """
    # Load data to process
    raw_data = db_utils.fetch_transactions_from_batch(
        batch_id=batch_id, institution_id=self.config.institution_id
    )
    self.transactions = self.parse_raw_data(raw_data)

    # Loop through all transactions in the dataset
    for transaction in self.transactions:
        # loop through our templates and qualifiers to find a match
        found_match = self.find_banking_template(transaction=transaction)
        template_id_match = None
        if found_match:
            template_id_match = found_match.id

        db_utils.add_processed_transaction(
            transaction_id=transaction.transaction_id,
            template_id=template_id_match,
            processed_batch_id=processed_batch_id,
            institution_id=self.config.institution_id,
        )


@app.post("/processed_batch/<batch_id>/apply_template/<template_id>")
@app.doc(tags=['Actions'])
async def apply_template(batch_id: int, template_id: int):
    # check for commit flag
    apply_template = request.args.get('commit', False)
    override_existing = request.args.get('override_category', False)
    logging.info(f"got commit value of {apply_template} and override category of {override_existing}")

    # Get institution id from template
    template = db_utils.db_access.query_templates_by_id(template_id)[0]
    logging.info(f"Template: {template}")
    # (7235, 2, 2002, False, 'Cash Advance', 'Visa Advance')
    # [(7235, 'Cash Advance', False, 'Visa Advance', 2, 'Wells Fargo Visa', 'WLS_VISA', None,
    # None, None, None, None, None, 2002, 'Cash', None, None, None)]

    # (7242, 'Temu', False, 'Temu', 1, 'Wells Fargo Checking', 'WLS_CHK', None, None, None,
    #                    CID     CV     CN    QID         QV                Q-DataColumn
    # None, None, None, 2010, 'Hobby', None, 5305, 'TEMU.COM WWW.TEMU.COM', 'Description')
    # TODO: need to handle multiple qualifiers
    assert len(template) == 19, f"Wrong template record length? {len(template)}"
    qualifiers = []
    if template[16]:
        qualifiers.append((template[17], template[18]))

    assert qualifiers, "No qualifiers for template"
    institution_id = template[4]
    logging.info(f"bank id: {institution_id}")

    # Now configure our processor from the above institution
    processor_class = db_utils.find_class_from_institution(institution_id)
    cp = configure_processor(
        datafile=None,
        processor_class=processor_class,
        institution_id=institution_id
    )

    if apply_template:
        cp.match_templates(batch_id=batch_id, processed_batch_id=batch_id)
    else:
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
        logging.info(f"Processed Record: {processed_records[0]}")
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
        class PR:
            def __init__(self, record):
                self.transaction_id = record[0]
                self.template_id = record[3]
                self.category_id = record[18]
                self.institution_id = record[8]
                self.transaction_data = record[9]
                self.description = record[10]
                self.category = ''     # need to pull in qualifier field
                self.new_template_id = None

            def __repr__(self):
                return f"""XID: {self.transaction_id}\nOld tid: {self.template_id}
                            New tid: {self.new_template_id}
                           raw: {self.transaction_data}"""

        entries = []
        logging.info(f"Checking {len(processed_records)} transactions")
        record_count = 0
        for record in processed_records:
            entry = PR(record)
            if entry.institution_id == institution_id:
                # assumes the parameter has a .description, a .category and .qualifiers (list of strings)
                record_count += 1
                found_match = match_template(qualifiers=qualifiers, transaction=entry)
                if found_match:
                    entry.new_template_id = template_id
                    entries.append(entry)

        logging.info(f"Found matching bank records: {record_count}")
        logging.info(f"Found matching entries: {len(entries)}")
        logging.info(entries)

        # Process results
        for entry in entries:
            """
            From our processed batch, find the matching transaction from our entry.
            Then update template_id of that entry.
            """
            db_utils.db_access.update_processed_transaction(id=entry.transaction_id, template_id=entry.new_template_id)

    return f"Applying template: {template_id} to batch {batch_id}"


if __name__ == '__main__':
    app.run(host="0.0.0.0")
