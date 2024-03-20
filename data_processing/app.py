from apiflask import APIFlask
from flask import request, json, jsonify
from data_processing.rich import OurRich

from data_processing.backend import load_sources, create_batch, update_batch, configure_processor
from data_processing.processors import select_processors_from_batch
from data_processing.match_qualifiers import find_template_matches, match_qualifiers
from data_processing.schemas import LoadSchema, ProcessSchema

import data_processing.db_utils as db_utils


"""
import logging
from rich.logging import RichHandler
from rich.json import JSON

FORMAT = "%(message)s"
logging.basicConfig(
    level="NOTSET", format=FORMAT, datefmt="[%X]", handlers=[RichHandler()]
)

log = logging.getLogger("rich")
log.info("Hello, World!")
log.info(JSON.from_data({
            "message": "Found template match",
            "template_id": 1,
            "qualifiers": [],
            "description": "transaction.description"
        }).text)
"""
# --------------------------------------------------------------


class RichConfig:
    RICH_LOGGING = True


# set openapi.info.title and openapi.info.version
app = APIFlask(__name__, title='Data Processing', version='1.0')
app.logger.handlers.clear()
app.config.from_object(RichConfig())
OurRich.init_app(app)
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


@app.post('/import')
@app.input(LoadSchema, location='json')
@app.doc(tags=['Batches'])
def load_datafiles(payload):
    """Load activity reports for processing."""
    # logging.info(f"Loading data files...{request.json}")
    # payload = request.json
    app.logger.info(f"Loading data files...{payload}")

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
    app.logger.info(f"Process payload - 'process_a_transaction_batch' : {json_data}")
    payload = json_data

    batch_id = payload.get('batch_id', None)
    notes = payload.get('notes', None)

    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id, notes=notes)
    app.logger.info(
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
        app.logger.info(f"cp: {processor_info}")
        cp.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)

    resp = json_data
    resp["processed_batch_id"] = processed_batch_id
    app.logger.info(f"Returning response: {json_data}")
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


@app.post("/processed_batch/<batch_id>/apply_template/<template_id>")
@app.doc(tags=['Actions'])
async def apply_template(batch_id: int, template_id: int):
    """
    Matches the specified template against the specified processed batch.
    Templates are Institution specific, so we only need the transactions
        matching the template bank.

    flags: commit
            - if true, apply the changes.
           override_category
            - if false, check the category of the individual transaction.  If it has
                a category assigned, leave it alone.
    returns: JSON document containing changes that would be / were applied

    """
    # check for commit flag
    apply_template = request.args.get('commit', False)
    override_existing = request.args.get('override_category', False)
    app.logger.info(f"got commit value of {apply_template} and override category of {override_existing}")

    # Get institution id from template
    template = db_utils.db_access.query_templates_by_id(template_id)[0]
    app.logger.info(f"Template: {template}")
    """
      0                                       5                                       9
    (7242, 'Temu', False, 'Temu', 1, 'Wells Fargo Checking', 'WLS_CHK', None, None, None,
     10                 13                   16    
                       CID     CV     CN    QID         QV                Q-DataColumn
    None, None, None, 2010, 'Hobby', None, 5305, 'TEMU.COM WWW.TEMU.COM', 'Description')
    """
    # TODO: need to handle multiple qualifiers

    assert len(template) == 19, f"Wrong template record length? {len(template)}"
    qualifiers = []
    if template[16]:
        qualifiers.append((template[17], template[18]))

    assert qualifiers, "No qualifiers for template"
    institution_id = template[4]
    app.logger.info(f"bank id: {institution_id}")

    # Figure out changes
    changed_transactions = find_template_matches(batch_id, qualifiers, institution_id, template_id)
    return changed_transactions

    # if apply_template:
    # Now configure our processor from the above institution
    #     processor_class = db_utils.find_class_from_institution(institution_id)
    #     cp = configure_processor(
    #         datafile=None,
    #         processor_class=processor_class,
    #         institution_id=institution_id
    #     )
    #     cp.match_templates(batch_id=batch_id, processed_batch_id=batch_id)
    # else:
    #     # Process results
    #     for entry in changed_transactions:
    #         """
    #         From our processed batch, find the matching transaction from our entry.
    #         Then update template_id of that entry.
    #         """
    #         db_utils.db_access.update_processed_transaction(id=entry.transaction_id, template_id=entry.new_template_id)


@app.post("/processed_batch/<batch_id>/match_qualifiers/")
@app.doc(tags=['Actions'])
async def find_qualifier_matches(batch_id: int):
    """
    Matches the qualifiers against the specified processed batch.
    returns: JSON document containing changes that would be applied

    const payload = {
        "batch_id": transaction.processed_batch_id,
        "hint": hintText,
        "category_id": category,
        "is_credit": isCredit,
        "notes": notesText,
        "institution_id": transaction.institution_id,
        "qualifiers":
            qualifiers.map((item) => {
                return({"value": item.value, "data_column": item.data_column})
            }),
        "tags": []
    }
    """
    json_data = request.json
    qualifiers = json_data['qualifiers']
    institution_id = json_data['institution_id']

    assert json_data['batch_id'] == int(batch_id), f"Non-matching ids: {type(batch_id)}, {type(json_data['batch_id'])}"
    assert qualifiers, "No qualifiers for template"

    # Figure out changes
    changed_transactions = match_qualifiers(batch_id, qualifiers, institution_id)
    app.logger.info(f"Responding with: {changed_transactions}")
    try:
        response = json.dumps(changed_transactions)
        return response
    except Exception as e:
        app.logger.exception(e)
        raise e


if __name__ == '__main__':
    app.run(host="0.0.0.0")
