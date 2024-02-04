import logging

from flask import Flask, request

from data_processing.backend import *
from data_processing.logger import setup_rich_logger
from data_processing.processors import select_processors_from_batch

setup_rich_logger()
# app = Flask(__name__)


from apiflask import APIFlask, Schema, abort
from apiflask.fields import Integer, String
from apiflask.validators import Length, OneOf

# set openapi.info.title and openapi.info.version
app = APIFlask(__name__, title='Pet API', version='1.0')

# All the OpenAPI field config can be set with the corresponding attributes of the app instance:
# app.description = '...'

# openapi.info.description
app.config['DESCRIPTION'] = """
The description for this API. It can be very long and **Markdown** is supported.

In this example, the tags is manually set. However, in a real world application, it will be
enough to use the automatic tags feature based on blueprint, see the example for blueprint
tags under the "examples/blueprint_tags" folder:

```
$ cd ..
$ cd blueprint_tags
$ flask run
```

The source can be found at [examples/blueprint_tags/app.py][_blueprint_tags].

[_blueprint_tags]: https://github.com/apiflask/apiflask/tree/main/examples/blueprint_tags/app.py
"""

# openapi.info.contact
app.config['CONTACT'] = {
    'name': 'API Support',
    'url': 'https://greyli.com/en',
    'email': 'withlihui@gmail.com'
}

# openapi.info.license
app.config['LICENSE'] = {
    'name': 'MIT',
    'url': 'https://opensource.org/licenses/MIT'
}

# openapi.info.termsOfService
app.config['TERMS_OF_SERVICE'] = 'http://example.com'

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
app.config['TAGS'] = [
    {'name': 'Hello', 'description': 'The description of the **Hello** tag.'},
    {'name': 'Pet', 'description': 'The description of the **Pet** tag.'}
]

# If you don't need to set tag "description" or tag "externalDocs", just pass a list a string:
# app.config['TAGS'] = ['Hello', 'Pet']

# openapi.servers
app.config['SERVERS'] = [
    {
        'name': 'Development Server',
        'url': 'http://localhost:5000'
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


@app.get('/')
def root():
    return 'Hello World'


# ---------------------------------- Command Line Interface Handling (CLI) ------------------------------------

class LoadSchema(Schema):
    source = String(metadata={'title': 'Source Folder', 'description': 'Folder to load.'})
    fileentry = String(metadata={'title': 'File Source', 'description': 'Single file to load.'})
    override = Integer(metadata={'title': 'Batch Override', 'description': 'Replace contents of specified batch.'})
    notes = String(metadata={'title': 'Notes', 'description': 'Optional notes for this batch.'})


@app.post('/import')
@app.input(LoadSchema, location='json')
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
def process_a_transaction_batch():
    payload = request.json

    batch_id = payload.get('batch_id', None)
    notes = payload.get('notes', None)

    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id, notes=notes)
    print(
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
    return f"Process load complete.  New Processed batch: {processed_batch_id}"


@app.route('/process/<batch_id>', methods=['DELETE'])
def delete_a_transaction_batch(batch_id: int):
    # Delete this batch id
    db_utils.delete_processed_batch(batch_id)
    return f"Deleting Processed Batch: {batch_id}"


@app.route('/templatereport/<batch_id>')
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


@app.post("/batch/{batch_id}/process")
async def process_batch(batch_id: int):
    return f"Generating processed batch from {batch_id}"


@app.post("/processed_batch/{batch_id}/rerun")
async def rereun_processed_batch(batch_id: int):
    return f"Rerunning batch {batch_id}"


@app.post("/processed_batch/apply_template/{template_id}")
async def apply_template(template_id: int):
    return f"Applying template: {template_id}"


if __name__ == '__main__':
    app.run(host="0.0.0.0")
